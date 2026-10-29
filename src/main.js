import { locale, t } from './i18n.js';
import { initPreferences } from './preferences.js';
import { compressImage, compressImageToTarget, compressPdf, estimatePdf, pdfPreview, validateFile, MAX_ESTIMATE_SIZE } from './conversion.js';
import { imageToPdf, imagesToPdf, pdfToImagesZip, pdfToText } from './extra-conversion.js';
import { docxToText, xlsxToCsv } from './office-conversion.js';
import { officeToPdf, pptxToText } from './office-conversion.js';
import { convertMedia, mediaSupport } from './media-conversion.js';
import { zipBlobs } from './zip.js';
import { fillUploadField } from './upload-field.js';
import { installFileDrop } from './file-drop.js';
import { imageFromPaste, readClipboardImage } from './clipboard-image.js';
import { editPdfPages, inspectPdfPages, mergePdfs } from './pdf-pages.js';
import { MAX_IMAGE_PIXELS, MAX_IMAGE_SIDE } from './limits.js';
import { stripGifMetadata, stripPdfMetadata } from './metadata.js';

const $ = (id) => document.getElementById(id);
const quality = $('quality');
const format = $('format');
const target = $('target-size');
const outputName = $('output-name');
let file = null;
let result = null;
let operation = null;
let estimation = null;
let estimateTimer;
let estimateData = null;
let imageCache = null;
let selectionVersion = 0;
let downloadTimer;
let downloadStarted = false;
let progressMessage = null;
let mergedPdf = null;
let pdfPageSource = null;
let pdfPageDraft = null;
let pdfPageLoad = 0;
let pdfPageDownloadBlocked = false;
let uploadTabId = Number(new URL(location.href).searchParams.get('sourceTab')) || null;
const items = [];
let nextItemId = 0;
const MAX_BATCH_FILES = 20;
const previewUrls = [];
const imageOutputs = [['image/jpeg', 'JPEG'], ['image/png', 'PNG'], ['image/webp', 'WebP'], ['image/gif', 'GIF'], ['application/pdf', 'PDF']];
const avifCanvas = document.createElement('canvas');
avifCanvas.width = avifCanvas.height = 1;
if (avifCanvas.toDataURL('image/avif').startsWith('data:image/avif')) imageOutputs.splice(4, 0, ['image/avif', 'AVIF']);
const audioOutputs = [['audio/mpeg', 'MP3'], ['audio/mp4', 'M4A'], ['audio/aac', 'AAC'], ['audio/ogg', 'Opus (OGG)'], ['audio/flac', 'FLAC'], ['audio/wav', 'WAV']];
const videoContainers = [['video/mp4', 'MP4'], ['video/quicktime', 'MOV'], ['video/webm', 'WebM'], ['video/x-matroska', 'MKV'], ['video/mp2t', 'MPEG-TS']];
const videoOutputs = [...videoContainers, ['image/gif', 'GIF'], ['image/jpeg', 'JPG frame'], ['image/png', 'PNG frame'], ['image/webp', 'WebP frame'], ...audioOutputs];
const pdfOutputs = [['application/pdf', 'PDF'], ['text/plain', 'TXT'], ['application/x-locoverte-jpeg-pages', 'JPG pages (ZIP)'], ['application/x-locoverte-png-pages', 'PNG pages (ZIP)'], ['application/x-locoverte-webp-pages', 'WebP pages (ZIP)']];
if (imageOutputs.some(([type]) => type === 'image/avif')) pdfOutputs.push(['application/x-locoverte-avif-pages', 'AVIF pages (ZIP)']);
const formats = {
  'image/jpeg': imageOutputs,
  'image/png': imageOutputs,
  'image/webp': imageOutputs,
  'image/avif': imageOutputs,
  'image/bmp': imageOutputs,
  'image/gif': [...imageOutputs, ...videoContainers],
  'image/tiff': imageOutputs,
  'image/heic': imageOutputs,
  'application/pdf': pdfOutputs,
  'audio/mpeg': audioOutputs,
  'audio/mp4': audioOutputs,
  'audio/aac': audioOutputs,
  'audio/wav': audioOutputs,
  'audio/ogg': audioOutputs,
  'audio/flac': audioOutputs,
  'video/mp4': videoOutputs,
  'video/quicktime': videoOutputs,
  'video/webm': videoOutputs,
  'video/x-matroska': videoOutputs,
  'video/mp2t': videoOutputs,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [['application/pdf', 'PDF'], ['text/plain', 'TXT']],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': [['application/pdf', 'PDF'], ['text/csv', 'CSV']],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': [['application/pdf', 'PDF'], ['text/plain', 'TXT']],
};
const extensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif', 'image/gif': 'gif', 'application/pdf': 'pdf', 'application/zip': 'zip', 'text/plain': 'txt', 'text/csv': 'csv', 'audio/wav': 'wav', 'audio/mpeg': 'mp3', 'audio/mp4': 'm4a', 'audio/aac': 'aac', 'audio/ogg': 'ogg', 'audio/flac': 'flac', 'video/mp4': 'mp4', 'video/quicktime': 'mov', 'video/webm': 'webm', 'video/x-matroska': 'mkv', 'video/mp2t': 'ts' };
const mediaCapabilities = new Map();
let mediaCapabilityCheck;

function availableFormats(type) {
  const options = formats[type];
  const supported = options.filter(([output]) => mediaCapabilities.get(output) !== false);
  return supported.length ? supported : options;
}

async function checkMediaCapabilities() {
  mediaCapabilityCheck ??= Promise.all(['image/gif', 'image/jpeg', 'image/png', 'image/webp', ...audioOutputs.map(([type]) => type), ...videoContainers.map(([type]) => type)].map(async (type) => {
    try { mediaCapabilities.set(type, await mediaSupport(type)); }
    catch { mediaCapabilities.set(type, false); }
  }));
  await mediaCapabilityCheck;
}

function formatBytes(bytes) {
  const units = locale === 'fr' ? ['o', 'Ko', 'Mo', 'Go'] : ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(3, bytes < 1024 ? 0 : bytes < 1024 ** 2 ? 1 : bytes < 1024 ** 3 ? 2 : 3);
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: index ? 2 : 0 }).format(bytes / 1024 ** index)} ${units[index]}`;
}

function showError(message) {
  $('error').textContent = message;
  $('error').hidden = false;
}

function settings() {
  const strength = Number(quality.value);
  const isPdf = file?.type === 'application/pdf';
  return { strength, value: 100 - strength, isPdf, outputType: format.value };
}

function imageOptions() {
  const raw = $('max-dimension').value.trim();
  const maxDimension = raw ? Number(raw) : null;
  if (raw && (!Number.isInteger(maxDimension) || maxDimension < 1 || maxDimension > MAX_IMAGE_SIDE)) throw new Error(t('invalidDimension'));
  const dimension = (id) => {
    const text = $(id).value.trim();
    const value = text ? Number(text) : null;
    if (text && (!Number.isInteger(value) || value < 1 || value > MAX_IMAGE_SIDE)) throw new Error(t('invalidOutputDimensions'));
    return value;
  };
  const width = dimension('output-width');
  const height = dimension('output-height');
  if (width && height && width * height > MAX_IMAGE_PIXELS) throw new Error(t('invalidOutputDimensions'));
  if (maxDimension && (width || height)) throw new Error(t('conflictingDimensions'));
  const squareMode = $('square-mode').value;
  if (squareMode !== 'none' && width && height && width !== height) throw new Error(t('invalidSquareDimensions'));
  return { maxDimension, width, height, rotation: Number($('rotation').value), squareCrop: squareMode === 'crop', squarePad: squareMode === 'pad', backgroundColor: $('background-fill').checked ? $('background-color').value : null };
}

function hasImageAdjustments(options) {
  return !!(options.maxDimension || options.width || options.height || options.rotation || options.squareCrop || options.squarePad || options.backgroundColor);
}

function targetBytesFor(source, outputType) {
  const enabled = source.type.startsWith('image/') && outputType.startsWith('image/')
    && !(source.type === 'image/gif' && outputType === 'image/gif')
    || source.type === 'application/pdf' && outputType === 'application/pdf';
  const raw = enabled ? target.value.trim() : '';
  if (!raw) return null;
  const bytes = Number(raw.replace(',', '.')) * 1024 ** 2;
  if (!Number.isFinite(bytes) || bytes <= 0) throw new Error(t('invalidTarget'));
  return bytes;
}

function customFilename(type) {
  const name = outputName.value.trim();
  if (!name) return null;
  if (/[\\/:*?"<>|\x00-\x1f]/.test(name) || /[. ]$/.test(name)) throw new Error(t('invalidOutputName'));
  const extension = extensions[type];
  if (!extension) throw new Error(t('invalidOutputName'));
  const base = name.replace(new RegExp(`\\.${extension}$`, 'i'), '');
  if (!base || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(base)) throw new Error(t('invalidOutputName'));
  return `${base}.${extension}`;
}

function applyOutputName(current) {
  const filename = customFilename(current.blob.type);
  if (filename) current.filename = filename;
  else delete current.filename;
}

function setFormats(type) {
  const options = availableFormats(type);
  format.replaceChildren(...options.map(([value, label]) => new Option(label, value)));
  format.value = options.some(([value]) => value === type) ? type : options[0][0];
}

function stopEstimate() {
  clearTimeout(estimateTimer);
  estimation?.abort();
  estimation = null;
}

function setBusy(busy) {
  for (const control of [quality, format, target, outputName, $('max-dimension'), $('output-width'), $('output-height'), $('rotation'), $('square-mode'), $('background-fill'), $('remove-metadata'), $('process')]) control.disabled = busy;
  $('background-color').disabled = busy || !$('background-fill').checked;
  $('cancel').hidden = !busy;
  $('progress').hidden = !busy;
  $('estimate').hidden = busy || !file || !!result;
  $('workspace').setAttribute('aria-busy', String(busy));
  $('process').textContent = t(busy ? 'processing' : 'process');
  renderPdfPages();
  if (items.length > 1) renderBatch();
}

function stopOperation() {
  operation?.abort();
  operation = null;
  setBusy(false);
}

function clearResult() {
  result = null;
  $('process').hidden = false;
  $('download').hidden = true;
  downloadStarted = false;
  clearTimeout(downloadTimer);
  $('download').disabled = false;
  $('download-status').hidden = true;
  $('result-panel').hidden = true;
  $('preview').hidden = true;
  $('preview-error').hidden = true;
  $('original-preview').removeAttribute('src');
  $('result-preview').removeAttribute('src');
  previewUrls.splice(0).forEach((url) => URL.revokeObjectURL(url));
  $('app').classList.remove('has-result');
  $('upload-field').hidden = true;
  $('upload-warning').hidden = true;
  $('upload-status').hidden = true;
}

function renderSettings() {
  if (!file) return;
  const { strength, isPdf, outputType } = settings();
  const isAudio = file.type.startsWith('audio/');
  const isVideo = file.type.startsWith('video/');
  const isOffice = file.type.includes('officedocument');
  const isPdfText = isPdf && outputType === 'text/plain';
  const gifToVideo = file.type === 'image/gif' && outputType.startsWith('video/');
  const unchangedGif = file.type === 'image/gif' && outputType === 'image/gif';
  const hasQuality = !isPdfText && !isOffice;
  const isImageOutput = file.type.startsWith('image/') && outputType.startsWith('image/');
  $('quality-row').hidden = !hasQuality;
  $('format-row').hidden = false;
  const isImage = file.type.startsWith('image/');
  $('adjust-options').hidden = !isImage && !isPdf;
  $('pdf-pages-tools').hidden = !isPdf;
  $('adjust-label').textContent = t(isPdf ? 'pdfAdjust' : 'imageAdjust');
  $('image-controls').hidden = !isImageOutput;
  $('target-row').hidden = unchangedGif || !isImageOutput && (!isPdf || outputType !== 'application/pdf');
  const targetText = target.value.trim();
  const summary = [targetText ? t('targetSizeSummary', { size: targetText }) : '', outputName.value.trim() ? t('renamedSummary') : ''].filter(Boolean).join(' · ');
  $('adjust-summary').hidden = !summary;
  $('adjust-summary').textContent = summary;
  $('pdf-notice').hidden = unchangedGif || !isPdf && !isOffice && !isAudio && !isVideo && !['image/gif', 'image/tiff', 'image/heic'].includes(file.type);
  $('pdf-notice').textContent = isOffice ? t(outputType === 'application/pdf' ? 'officePdfNotice' : outputType === 'text/csv' ? 'xlsxNotice' : 'docxNotice')
    : isAudio || isVideo || gifToVideo ? t('mediaNotice')
      : ['image/gif', 'image/tiff'].includes(file.type) ? t('firstFrameNotice')
        : file.type === 'image/heic' ? t('heicNotice')
    : isPdfText ? t('pdfTextNotice') : outputType.includes('locoverte-') ? t('pdfImageNotice') : t(strength <= 30 ? 'pdfStructureNotice' : 'pdfRasterNotice');
  $('metadata-notice').hidden = !$('remove-metadata').checked || !isPdf || outputType !== 'application/pdf';
  $('file-name').textContent = file.name;
  $('file-name').title = file.name;
  $('file-size').textContent = formatBytes(file.size);
  $('file-kind').textContent = isOffice ? (file.type.includes('wordprocessingml') ? 'DOCX' : file.type.includes('spreadsheetml') ? 'XLSX' : 'PPTX')
    : file.type === 'audio/mpeg' ? 'MP3' : file.type === 'audio/wav' ? 'WAV' : isPdf ? 'PDF' : file.type.split('/')[1].toUpperCase().replace('JPEG', 'JPG');
  if (!hasQuality) { $('quality-warning').hidden = true; return; }
  const level = strength > 65 ? 'low' : strength > 30 ? 'medium' : 'good';
  $('workspace').dataset.quality = level;
  $('quality-output').textContent = t(strength <= 30 ? 'gentle' : strength <= 65 ? 'balanced' : 'strong');
  quality.setAttribute('aria-valuetext', $('quality-output').textContent);
  const unchangedPng = outputType === 'image/png' && imageCache && imageCache.sourceWidth === imageCache.width && imageCache.sourceHeight === imageCache.height && !target.value;
  const alreadyFits = isImageOutput && outputType === file.type && !$('max-dimension').value && !$('output-width').value && !$('output-height').value && $('square-mode').value === 'none' && !$('background-fill').checked && $('rotation').value === '0'
    && Number(target.value.replace(',', '.')) * 1024 ** 2 >= file.size;
  $('quality-warning').hidden = strength <= 65 || unchangedPng || alreadyFits;
  $('quality-warning').textContent = t(isAudio || isVideo ? 'mediaWarning' : isPdf ? 'pdfWarning' : outputType === 'image/png' ? 'pngWarning' : 'imageWarning');
}

function renderEstimate() {
  const estimate = $('estimate');
  estimate.hidden = !file || !!result || !!operation || estimateData?.key === 'noEstimate';
  if (!file || !estimateData) return;
  if (estimateData.key) {
    if (estimateData.key !== 'original') {
      estimate.textContent = t(estimateData.key);
      return;
    }
  }
  const { size = file.size, pages, image } = estimateData;
  const percent = Math.round((size / file.size - 1) * 100);
  const sameFormat = file.type === format.value;
  const note = sameFormat && size >= file.size && !estimateData.transformed ? t('estimateKeepOriginal')
    : pages > 1 ? t('estimateFirstPage')
      : image && (image.width !== image.sourceWidth || image.height !== image.sourceHeight)
        ? t('estimateResolution', { width: image.width, height: image.height }) : '';
  const heading = document.createElement('div');
  heading.className = 'estimate-heading';
  const label = document.createElement('span');
  label.textContent = t('estimateTitle');
  const change = document.createElement('strong');
  change.className = `estimate-change ${percent < 0 ? 'decrease' : percent > 0 ? 'increase' : ''}`;
  change.textContent = `${percent < 0 ? '−' : percent > 0 ? '+' : ''}${Math.abs(percent)} %`;
  heading.append(label, change);
  const sizes = document.createElement('div');
  sizes.className = 'estimate-sizes';
  sizes.textContent = `${formatBytes(file.size)} → ${formatBytes(size)}`;
  estimate.replaceChildren(heading, sizes);
  if (note) {
    const detail = document.createElement('small');
    detail.textContent = note;
    estimate.append(detail);
  }
}

function renderResult() {
  if (!result) return;
  const { blob, source, targetBytes, sameFormat, keepOriginal, isPdf, reducedFurther, image } = result;
  const saved = source.size - blob.size;
  const targetNote = targetBytes ? ` ${t(blob.size <= targetBytes ? 'targetReached' : 'targetNotReached')}` : '';
  $('result-stats').textContent = !sameFormat
    ? t('convertedResult', { result: formatBytes(blob.size), original: formatBytes(source.size), target: targetNote })
    : saved > 0
      ? t('savedResult', { result: formatBytes(blob.size), original: formatBytes(source.size), percent: Math.round(saved / source.size * 100), target: targetNote })
      : !keepOriginal ? t('adjustedResult', { result: formatBytes(blob.size), original: formatBytes(source.size), target: targetNote })
        : t('noSmallerResult', { onePixel: image?.sourceWidth === 1 && image?.sourceHeight === 1 ? t('onePixelResult') : '', target: targetNote });
  if (isPdf && !keepOriginal && result.blob.type === 'application/pdf') $('result-stats').textContent += t('pdfResultWarning');
  if (isPdf && result.blob.type === 'text/plain') $('result-stats').textContent += t('pdfTextResult');
  if (source.type.includes('officedocument')) $('result-stats').textContent += t('officeResultWarning');
  if (reducedFurther && !keepOriginal) $('result-stats').textContent += t('targetAdjusted');
  if (result.metadataRemoved) $('result-stats').textContent += t('metadataRemovedResult');
  if (result.reason) $('result-stats').textContent += ` ${t(result.reason)}`;
  $('result-size').textContent = formatBytes(blob.size);
  $('download').textContent = t($('download').disabled ? 'downloadStarted' : downloadStarted ? 'downloadAgain' : 'download');
  $('download-status').textContent = t('downloadStatus');
  $('process').hidden = true;
  $('download').hidden = false;
  $('result-panel').hidden = false;
  $('app').classList.add('has-result');
  $('estimate').hidden = true;
  $('upload-field').hidden = !uploadTabId;
  $('upload-warning').hidden = !uploadTabId;
}

function render() {
  $('drop-label').textContent = t(items.length ? 'addFiles' : 'dropFile');
  renderSettings();
  renderEstimate();
  renderResult();
  renderPdfPages();
  if (items.length > 1) renderBatch();
  $('process').textContent = t(operation ? 'processing' : 'process');
  if (progressMessage) $('progress').textContent = t(progressMessage.key, progressMessage.values);
}

function scheduleEstimate() {
  stopEstimate();
  imageCache = null;
  if (!file) return;
  const source = file;
  const config = settings();
  const isImage = source.type.startsWith('image/');
  const estimable = (config.isPdf && config.outputType === 'application/pdf') || (isImage && config.outputType.startsWith('image/'));
  const key = !estimable || (isImage && target.value.trim()) ? 'noEstimate'
    : source.size > MAX_ESTIMATE_SIZE ? (config.isPdf ? 'largePdfEstimate' : 'largeImageEstimate') : 'calculating';
  estimateData = { key };
  render();
  if (key !== 'calculating') return;
  const controller = new AbortController();
  estimation = controller;
  estimateTimer = setTimeout(async () => {
    try {
      const options = isImage ? imageOptions() : {};
      const data = config.isPdf ? await estimatePdf(source, $('remove-metadata').checked ? Math.min(config.value, 69) : config.value, controller.signal)
        : await compressImage(source, config.outputType, config.value, controller.signal, options);
      if (controller.signal.aborted) return;
      if (config.isPdf) estimateData = data;
      else {
        imageCache = data;
        estimateData = { size: data.blob.size, image: data, transformed: hasImageAdjustments(options) };
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      estimateData = { key: 'noEstimate' };
    } finally {
      if (estimation === controller) { estimation = null; render(); }
    }
  }, config.isPdf ? 500 : 300);
}

async function selectFiles(candidates) {
  if (!candidates.length || operation) return;
  if (items.length + candidates.length > MAX_BATCH_FILES) return showError(t('batchLimit'));
  const version = ++selectionVersion;
  const accepted = [];
  const errors = [];
  for (const candidate of candidates) {
    try {
      const source = await validateFile(candidate);
      accepted.push({ id: ++nextItemId, source, result: null, error: '', status: 'batchReady', downloaded: false });
    } catch (error) { errors.push(`${candidate.name}: ${error.message}`); }
  }
  if (version !== selectionVersion) return;
  if (accepted.some(({ source }) => /^(audio|video)\//.test(source.type) || source.type === 'image/gif')) await checkMediaCapabilities();
  if (version !== selectionVersion) return;
  for (const item of accepted) {
    const options = availableFormats(item.source.type);
    item.outputType = item.source.type === 'audio/wav' && options.some(([type]) => type === 'audio/mpeg') ? 'audio/mpeg'
      : options.some(([type]) => type === item.source.type) ? item.source.type : options[0][0];
  }
  if (errors.length) showError(errors.join(' · '));
  else $('error').hidden = true;
  if (!accepted.length) return;
  if (!items.length) {
    $('max-dimension').value = '';
    $('output-width').value = '';
    $('output-height').value = '';
    $('rotation').value = '0';
    $('square-mode').value = 'none';
    $('background-fill').checked = false;
    $('background-color').value = '#ffffff';
    $('background-color').disabled = true;
    $('remove-metadata').checked = false;
    target.value = '';
    outputName.value = '';
    $('adjust-options').open = false;
  }
  mergedPdf = null;
  if (items.length === 1) {
    items[0].outputType = format.value;
    if (result) items[0].result = result;
  }
  items.push(...accepted);
  stopEstimate();
  clearResult();
  $('workspace').hidden = false;
  $('app').classList.add('has-file');
  showItems();
  render();
}

function showItems() {
  const batch = items.length > 1;
  $('single-workspace').hidden = batch;
  $('batch-workspace').hidden = !batch;
  $('workspace').hidden = !items.length;
  $('app').classList.toggle('has-file', !!items.length);
  if (!items.length) { file = null; resetPdfPages(); render(); return; }
  if (batch) { file = null; resetPdfPages(); renderBatch(); return; }
  file = items[0].source;
  if (pdfPageSource !== file) resetPdfPages();
  setFormats(file.type);
  format.value = items[0].outputType;
  quality.value = $('batch-quality').value;
  target.value = '';
  outputName.value = items[0].result?.filename?.replace(/\.[^.]+$/, '') ?? '';
  if (items[0].result) { result = items[0].result; render(); }
  else scheduleEstimate();
}

function renderBatch() {
  if (items.length < 2) return;
  const busy = !!operation;
  const strength = Number($('batch-quality').value);
  $('batch-count').textContent = t('batchCount', { count: items.length });
  $('batch-quality').disabled = busy;
  $('batch-remove-metadata').disabled = busy;
  $('batch-quality-output').textContent = t(strength <= 30 ? 'gentle' : strength <= 65 ? 'balanced' : 'strong');
  $('batch-quality').setAttribute('aria-valuetext', $('batch-quality-output').textContent);
  $('batch-workspace').dataset.quality = strength > 65 ? 'low' : strength > 30 ? 'medium' : 'good';
  const metadataPdf = $('batch-remove-metadata').checked && items.some((item) => item.source.type === 'application/pdf' && item.outputType === 'application/pdf');
  const pdfRaster = (strength > 30 || metadataPdf) && items.some((item) => item.source.type === 'application/pdf' && item.outputType === 'application/pdf');
  $('batch-pdf-notice').hidden = !pdfRaster && strength <= 65;
  $('batch-pdf-notice').textContent = t(metadataPdf ? 'removeMetadataPdfWarning' : pdfRaster ? 'batchPdfNotice' : 'qualityMuchLower');
  $('batch-process').disabled = busy;
  $('batch-process').textContent = t(busy ? 'processing' : 'batchProcess');
  $('batch-zip').hidden = !items.some((item) => item.result);
  $('batch-zip').disabled = busy;
  $('batch-cancel').hidden = !busy;
  const imagesOnly = items.every((item) => item.source.type.startsWith('image/'));
  const pdfsOnly = items.every((item) => item.source.type === 'application/pdf');
  $('merge-actions').hidden = !imagesOnly && !pdfsOnly;
  $('merge-pdf').textContent = t(pdfsOnly ? 'mergePdfs' : 'mergePdf');
  $('merge-pdf').disabled = busy;
  $('merge-download').hidden = !mergedPdf;
  $('merge-download').disabled = !!mergedPdf?.downloadBlocked;
  $('merge-download').textContent = t(mergedPdf?.downloadBlocked ? 'batchDownloadStarted' : mergedPdf?.downloaded ? 'downloadAgain' : 'batchDownload');
  $('merge-size').textContent = mergedPdf ? formatBytes(mergedPdf.blob.size) : '';
  const list = $('batch-list');
  list.replaceChildren(...items.map((item) => {
    const row = document.createElement('div');
    row.className = 'batch-item';
    row.dataset.id = item.id;
    const head = document.createElement('div');
    head.className = 'batch-item-head';
    const name = document.createElement('strong');
    name.className = 'batch-item-name';
    name.textContent = item.source.name;
    name.title = item.source.name;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'icon-button';
    remove.dataset.action = 'remove';
    remove.setAttribute('aria-label', `${t('removeFile')}: ${item.source.name}`);
    remove.title = t('removeFile');
    remove.disabled = busy;
    remove.textContent = '×';
    head.append(name, remove);
    const details = document.createElement('div');
    details.className = 'batch-item-details';
    const size = document.createElement('span');
    size.textContent = formatBytes(item.source.size);
    const select = document.createElement('select');
    select.dataset.action = 'format';
    select.setAttribute('aria-label', `${t('outputFormat')}: ${item.source.name}`);
    select.disabled = busy;
    select.replaceChildren(...availableFormats(item.source.type).map(([value, label]) => new Option(label, value)));
    select.value = item.outputType;
    details.append(size, select);
    const status = document.createElement('p');
    status.className = `batch-item-status${item.error ? ' batch-error' : ''}`;
    status.textContent = item.error || (item.result ? batchResultText(item.result) : t(item.status));
    row.append(head, details, status);
    if (item.result) {
      const download = document.createElement('button');
      download.type = 'button';
      download.className = 'secondary-button batch-download';
      download.dataset.action = 'download';
      download.disabled = item.downloadBlocked;
      download.textContent = t(item.downloadBlocked ? 'batchDownloadStarted' : item.downloaded ? 'downloadAgain' : 'batchDownload');
      row.append(download);
    }
    return row;
  }));
}

function batchResultText({ blob, source, keepOriginal, isPdf, metadataRemoved }) {
  const change = Math.round((blob.size / source.size - 1) * 100);
  const difference = change < 0 ? `−${Math.abs(change)} %` : change > 0 ? `+${change} %` : '0 %';
  const warning = source.type.includes('officedocument') ? t('officeResultWarning')
    : isPdf && blob.type === 'text/plain' ? t('pdfTextResult')
      : isPdf && !keepOriginal && blob.type === 'application/pdf' ? t('pdfResultWarning') : '';
  return `${t('batchDone')} · ${formatBytes(source.size)} → ${formatBytes(blob.size)} (${difference})${warning}${metadataRemoved ? t('metadataRemovedResult') : ''}`;
}

function outputFilename(current) {
  return current.filename ?? `${current.source.name.replace(/\.[^.]+$/, '')}${t(current.sameFormat ? 'fileSuffix' : 'convertedSuffix')}.${extensions[current.blob.type]}`;
}

function downloadResult(current) {
  const url = URL.createObjectURL(current.blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = outputFilename(current);
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function resetPdfPages() {
  pdfPageLoad += 1;
  pdfPageSource = null;
  pdfPageDraft = null;
  pdfPageDownloadBlocked = false;
  $('pdf-pages-tools').open = false;
  $('pdf-pages-status').textContent = '';
  $('pdf-pages-list').replaceChildren();
}

function renderPdfPages() {
  const ready = !!pdfPageDraft && pdfPageSource === file;
  const busy = !!operation;
  $('pdf-pages-save').disabled = !ready || busy || pdfPageDownloadBlocked;
  $('pdf-pages-extract').disabled = !ready || busy || pdfPageDownloadBlocked || !pdfPageDraft.some((page) => page.selected);
  $('pdf-pages-reset').disabled = !ready || busy;
  if (!ready) return;
  $('pdf-pages-status').textContent = t(pdfPageDraft.length === 1 ? 'pdfPagesOne' : 'pdfPagesCount', { count: pdfPageDraft.length });
  $('pdf-pages-list').replaceChildren(...pdfPageDraft.map((page, index) => {
    const row = document.createElement('div');
    row.className = 'pdf-page-row';
    row.dataset.index = index;
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = page.selected;
    checkbox.disabled = busy;
    checkbox.setAttribute('aria-label', t('pdfPageSelect', { number: page.sourceIndex + 1 }));
    const name = document.createElement('span');
    name.textContent = `${t('pdfPageLabel', { number: page.sourceIndex + 1 })}${page.rotation ? ` · ${page.rotation}°` : ''}`;
    label.append(checkbox, name);
    row.append(label);
    for (const [action, symbol, disabled] of [['up', '↑', index === 0], ['down', '↓', index === pdfPageDraft.length - 1], ['rotate', '↻', false], ['remove', '×', pdfPageDraft.length === 1]]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.action = action;
      button.textContent = symbol;
      button.title = t(`pdfPage${action[0].toUpperCase()}${action.slice(1)}`, { number: page.sourceIndex + 1 });
      button.setAttribute('aria-label', button.title);
      button.disabled = busy || disabled;
      row.append(button);
    }
    return row;
  }));
}

async function loadPdfPages() {
  if (!file || file.type !== 'application/pdf' || pdfPageSource === file) return;
  const source = file;
  const request = ++pdfPageLoad;
  $('pdf-pages-status').textContent = t('pdfPagesLoading');
  try {
    const pages = await inspectPdfPages(source);
    if (request !== pdfPageLoad || file !== source) return;
    pdfPageSource = source;
    pdfPageDraft = pages.map((page) => ({ ...page, selected: false }));
    renderPdfPages();
  } catch (error) {
    if (request === pdfPageLoad && file === source) $('pdf-pages-status').textContent = error.message;
  }
}

function changed() {
  stopOperation();
  clearResult();
  if (items.length === 1) {
    items[0].outputType = format.value;
    items[0].result = null;
    $('batch-quality').value = quality.value;
  }
  $('error').hidden = true;
  scheduleEstimate();
}

$('dropzone').addEventListener('click', () => $('file-input').click());
$('dropzone').addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); $('file-input').click(); }
});
$('file-input').addEventListener('change', (event) => {
  selectFiles([...event.target.files]);
  event.target.value = '';
});
installFileDrop(window, $('drop-overlay'), selectFiles);
$('paste-image').addEventListener('click', async () => {
  if (operation) return;
  try { await selectFiles([await readClipboardImage()]); }
  catch (error) { showError(error.message); }
});
window.addEventListener('paste', (event) => {
  if (operation || event.target instanceof Element && event.target.closest('input, textarea, [contenteditable="true"]')) return;
  const image = imageFromPaste(event.clipboardData);
  if (!image) return;
  event.preventDefault();
  selectFiles([image]);
});
$('pdf-pages-tools').addEventListener('toggle', () => {
  if ($('pdf-pages-tools').open) loadPdfPages();
});
$('pdf-pages-list').addEventListener('change', (event) => {
  if (!pdfPageDraft || event.target.type !== 'checkbox' || operation) return;
  const index = Number(event.target.closest('.pdf-page-row').dataset.index);
  pdfPageDraft[index].selected = event.target.checked;
  $('pdf-pages-extract').disabled = !pdfPageDraft.some((page) => page.selected);
});
$('pdf-pages-list').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button || !pdfPageDraft || operation) return;
  const index = Number(button.closest('.pdf-page-row').dataset.index);
  if (button.dataset.action === 'up' && index > 0) [pdfPageDraft[index - 1], pdfPageDraft[index]] = [pdfPageDraft[index], pdfPageDraft[index - 1]];
  if (button.dataset.action === 'down' && index < pdfPageDraft.length - 1) [pdfPageDraft[index + 1], pdfPageDraft[index]] = [pdfPageDraft[index], pdfPageDraft[index + 1]];
  if (button.dataset.action === 'rotate') pdfPageDraft[index].rotation = (pdfPageDraft[index].rotation + 90) % 360;
  if (button.dataset.action === 'remove' && pdfPageDraft.length > 1) pdfPageDraft.splice(index, 1);
  renderPdfPages();
  const nextIndex = button.dataset.action === 'up' ? index - 1 : button.dataset.action === 'down' ? index + 1 : Math.min(index, pdfPageDraft.length - 1);
  $('pdf-pages-list').querySelector(`.pdf-page-row[data-index="${Math.max(0, nextIndex)}"] button[data-action="${button.dataset.action}"]`)?.focus({ preventScroll: true });
});
$('pdf-pages-reset').addEventListener('click', () => {
  if (!pdfPageDraft || operation) return;
  resetPdfPages();
  $('pdf-pages-tools').open = true;
  loadPdfPages();
});
for (const [id, selectedOnly] of [['pdf-pages-save', false], ['pdf-pages-extract', true]]) {
  $(id).addEventListener('click', async () => {
    if (!file || !pdfPageDraft || operation || pdfPageDownloadBlocked) return;
    const plan = pdfPageDraft.filter((page) => !selectedOnly || page.selected);
    if (!plan.length) return showError(t('pdfPagesNoneSelected'));
    const controller = new AbortController();
    operation = controller;
    setBusy(true);
    $('pdf-pages-status').textContent = t('processingLocal');
    let started = false;
    try {
      let blob = await editPdfPages(file, plan, controller.signal);
      if ($('remove-metadata').checked) {
        blob = (await compressPdf(blob, 69, null, controller.signal, () => {})).blob;
        blob = await stripPdfMetadata(blob, controller.signal);
      }
      downloadResult({ blob, filename: `${file.name.replace(/\.pdf$/i, '')}${selectedOnly ? '-pages' : '-edited'}.pdf` });
      $('error').hidden = true;
      started = true;
      pdfPageDownloadBlocked = true;
      const source = file;
      setTimeout(() => {
        if (file !== source) return;
        pdfPageDownloadBlocked = false;
        renderPdfPages();
      }, 2000);
    } catch (error) {
      if (!controller.signal.aborted) showError(error.message);
    } finally {
      if (operation === controller) { operation = null; setBusy(false); }
      renderPdfPages();
      if (started) $('pdf-pages-status').textContent = t('pdfPagesDone');
    }
  });
}
$('remove-file').addEventListener('click', () => {
  selectionVersion += 1;
  stopOperation();
  stopEstimate();
  clearResult();
  items.length = 0;
  mergedPdf = null;
  file = null;
  resetPdfPages();
  imageCache = null;
  estimateData = null;
  $('workspace').hidden = true;
  $('error').hidden = true;
  $('app').classList.remove('has-file');
  render();
  $('dropzone').focus();
});
$('batch-list').addEventListener('change', (event) => {
  if (event.target.dataset.action !== 'format') return;
  const item = items.find((entry) => entry.id === Number(event.target.closest('.batch-item').dataset.id));
  if (!item || operation) return;
  item.outputType = event.target.value;
  item.result = null;
  item.error = '';
  item.status = 'batchReady';
  item.downloaded = false;
  item.downloadBlocked = false;
  renderBatch();
});
$('batch-list').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const item = items.find((entry) => entry.id === Number(button.closest('.batch-item').dataset.id));
  if (!item || operation) return;
  if (button.dataset.action === 'download') {
    if (!item.result || item.downloadBlocked) return;
    downloadResult(item.result);
    item.downloaded = true;
    item.downloadBlocked = true;
    renderBatch();
    $('batch-list').querySelector(`[data-id="${item.id}"] [data-action="download"]`)?.focus({ preventScroll: true });
    const current = item.result;
    setTimeout(() => {
      if (item.result !== current) return;
      item.downloadBlocked = false;
      renderBatch();
    }, 2000);
  } else if (button.dataset.action === 'remove') {
    items.splice(items.indexOf(item), 1);
    mergedPdf = null;
    clearResult();
    stopEstimate();
    showItems();
    render();
    if (!items.length) $('dropzone').focus();
  }
});
$('batch-quality').addEventListener('input', () => {
  mergedPdf = null;
  for (const item of items) { item.result = null; item.error = ''; item.status = 'batchReady'; item.downloaded = false; item.downloadBlocked = false; }
  renderBatch();
});
$('batch-remove-metadata').addEventListener('change', () => {
  mergedPdf = null;
  for (const item of items) { item.result = null; item.error = ''; item.status = 'batchReady'; item.downloaded = false; item.downloadBlocked = false; }
  renderBatch();
});
$('batch-zip').addEventListener('click', async () => {
  if (operation) return;
  const ready = items.filter((item) => item.result);
  if (!ready.length) return showError(t('zipNoResults'));
  const controller = new AbortController();
  operation = controller;
  $('batch-progress').hidden = false;
  $('batch-progress').textContent = t('processingLocal');
  renderBatch();
  try {
    const names = new Map();
    const entries = ready.map((item) => {
      const name = outputFilename(item.result);
      const count = (names.get(name) || 0) + 1;
      names.set(name, count);
      return { name: count === 1 ? name : name.replace(/(\.[^.]+)$/, `-${count}$1`), blob: item.result.blob };
    });
    const blob = await zipBlobs(entries, controller.signal);
    downloadResult({ blob, filename: 'locoverte-results.zip' });
    $('batch-progress').textContent = ready.length === items.length ? t('zipStarted') : t('zipPartial', { count: ready.length, total: items.length });
  } catch (error) { if (!controller.signal.aborted) showError(error instanceof Error ? error.message : t('processingError')); }
  finally { operation = null; renderBatch(); }
});
$('batch-cancel').addEventListener('click', () => operation?.abort());
$('merge-pdf').addEventListener('click', async () => {
  const imagesOnly = items.every((item) => item.source.type.startsWith('image/'));
  const pdfsOnly = items.every((item) => item.source.type === 'application/pdf');
  if (operation || items.length < 2 || (!imagesOnly && !pdfsOnly)) return;
  const controller = new AbortController();
  operation = controller;
  mergedPdf = null;
  $('batch-progress').hidden = false;
  renderBatch();
  try {
    const sources = items.map((item) => item.source);
    let blob = imagesOnly
      ? await imagesToPdf(sources, Number($('batch-quality').value), controller.signal, (key, values) => {
        $('batch-progress').textContent = t(key, values);
      })
      : await mergePdfs(sources, controller.signal, (current, total) => {
        $('batch-progress').textContent = t('batchProgress', { current, total, name: sources[current - 1].name });
      });
    if ($('batch-remove-metadata').checked) {
      if (pdfsOnly) blob = (await compressPdf(blob, 69, null, controller.signal, () => {})).blob;
      blob = await stripPdfMetadata(blob, controller.signal);
    }
    mergedPdf = { blob, filename: t(imagesOnly ? 'mergedPdfName' : 'mergedPdfsName') };
  } catch (error) {
    if (!controller.signal.aborted) showError(error instanceof Error ? error.message : t('processingError'));
  } finally {
    operation = null;
    $('batch-progress').hidden = true;
    renderBatch();
    if (mergedPdf) $('merge-download').focus({ preventScroll: true });
  }
});
$('merge-download').addEventListener('click', () => {
  if (!mergedPdf || mergedPdf.downloadBlocked) return;
  const current = mergedPdf;
  downloadResult(current);
  current.downloaded = true;
  current.downloadBlocked = true;
  renderBatch();
  setTimeout(() => {
    if (mergedPdf !== current) return;
    current.downloadBlocked = false;
    renderBatch();
  }, 2000);
});
quality.addEventListener('input', changed);
$('remove-metadata').addEventListener('change', changed);
format.addEventListener('change', () => {
  const supportsTarget = file?.type.startsWith('image/') && format.value.startsWith('image/')
    && !(file.type === 'image/gif' && format.value === 'image/gif')
    || file?.type === 'application/pdf' && format.value === 'application/pdf';
  if (!supportsTarget) target.value = '';
  changed();
});
for (const id of ['max-dimension', 'output-width', 'output-height']) $(id).addEventListener('input', () => {
  if (id === 'max-dimension' && $(id).value) { $('output-width').value = ''; $('output-height').value = ''; }
  else if ($(id).value) $('max-dimension').value = '';
  changed();
});
for (const id of ['rotation', 'square-mode', 'background-color']) $(id).addEventListener('change', changed);
$('background-fill').addEventListener('change', () => { $('background-color').disabled = !$('background-fill').checked; changed(); });
target.addEventListener('input', () => { clearResult(); if (items.length === 1) items[0].result = null; $('error').hidden = true; scheduleEstimate(); });
outputName.addEventListener('input', () => {
  $('error').hidden = true;
  if (result) {
    try { applyOutputName(result); }
    catch (error) { showError(error.message); }
  }
  renderSettings();
});
$('cancel').addEventListener('click', changed);

async function convert(source, outputType, strength, targetBytes, cached, signal, updateProgress, options = {}, removeMetadata = false) {
  const value = 100 - strength;
  const transformed = hasImageAdjustments(options);
  const image = source.type.startsWith('image/') && outputType.startsWith('image/')
    ? source.type === 'image/gif' && outputType === 'image/gif' && !transformed ? { blob: removeMetadata ? await stripGifMetadata(source, signal) : source }
      : cached ?? (targetBytes && source.type === outputType && source.size <= targetBytes && !transformed && !removeMetadata ? { blob: source, targetMet: true }
      : targetBytes ? await compressImageToTarget(source, outputType, targetBytes, signal, options) : await compressImage(source, outputType, value, signal, options)) : null;
  const conversion = image ?? (source.type === 'application/pdf' && outputType.includes('locoverte-')
    ? { blob: await pdfToImagesZip(source, outputType.includes('png-pages') ? 'image/png'
      : outputType.includes('webp-pages') ? 'image/webp' : outputType.includes('avif-pages') ? 'image/avif' : 'image/jpeg', strength, signal, updateProgress) }
    : source.type === 'application/pdf' && outputType === 'application/pdf'
    ? await compressPdf(source, removeMetadata ? Math.min(value, 69) : value, targetBytes, signal, updateProgress)
    : { blob: source.type === 'application/pdf' ? await pdfToText(source, signal, updateProgress)
      : source.type === 'image/gif' && outputType.startsWith('video/') ? await convertMedia(source, outputType, strength, signal, updateProgress)
        : source.type.startsWith('image/') ? await imageToPdf(source, strength, signal)
        : source.type.startsWith('audio/') || source.type.startsWith('video/') ? await convertMedia(source, outputType, strength, signal, updateProgress)
          : outputType === 'application/pdf' ? await officeToPdf(source, signal)
            : outputType === 'text/csv' ? await xlsxToCsv(source, signal)
              : source.type.includes('presentationml') ? await pptxToText(source, signal) : await docxToText(source, signal) });
  if (removeMetadata && conversion.blob.type === 'application/pdf') conversion.blob = await stripPdfMetadata(conversion.blob, signal);
  signal.throwIfAborted();
  const sameFormat = source.type === outputType;
  const keepOriginal = !removeMetadata && sameFormat && !transformed && conversion.blob.size >= source.size;
  return { blob: keepOriginal ? source : conversion.blob, source, sameFormat, keepOriginal, targetBytes, isPdf: source.type === 'application/pdf', reducedFurther: conversion.reducedFurther, reason: conversion.reason, image, metadataRemoved: removeMetadata };
}

$('batch-process').addEventListener('click', async () => {
  if (items.length < 2 || operation) return;
  const controller = new AbortController();
  operation = controller;
  $('error').hidden = true;
  $('batch-progress').hidden = false;
  renderBatch();
  const pending = [...items];
  for (const [index, item] of pending.entries()) {
    if (controller.signal.aborted) break;
    item.result = null;
    item.error = '';
    item.downloaded = false;
    item.downloadBlocked = false;
    item.status = 'batchWorking';
    $('batch-progress').textContent = t('batchProgress', { current: index + 1, total: pending.length, name: item.source.name });
    renderBatch();
    try {
      item.result = await convert(item.source, item.outputType, Number($('batch-quality').value), null, null, controller.signal, (key, values) => {
        $('batch-progress').textContent = `${t('batchProgress', { current: index + 1, total: pending.length, name: item.source.name })} · ${t(key, values)}`;
      }, {}, $('batch-remove-metadata').checked);
      item.status = 'batchDone';
    } catch (error) {
      if (controller.signal.aborted) { item.status = 'batchReady'; break; }
      item.error = `${t('batchFailed')}: ${error instanceof Error ? error.message : t('processingError')}`;
    }
    renderBatch();
  }
  if (operation === controller) operation = null;
  $('batch-progress').hidden = true;
  renderBatch();
  $('batch-list').querySelector('[data-action="download"]')?.focus({ preventScroll: true });
});

$('process').addEventListener('click', async () => {
  if (!file || operation) return;
  const source = file;
  const config = settings();
  let targetBytes;
  let options = {};
  try {
    targetBytes = targetBytesFor(source, config.outputType);
    if (source.type.startsWith('image/') && config.outputType.startsWith('image/')) options = imageOptions();
    if (outputName.value.trim()) customFilename(config.outputType.includes('locoverte-') ? 'application/zip' : config.outputType);
  } catch (error) { return showError(error.message); }
  const cached = imageCache;
  stopEstimate();
  clearResult();
  $('error').hidden = true;
  const controller = new AbortController();
  operation = controller;
  const updateProgress = (key, values) => {
    if (controller.signal.aborted) return;
    progressMessage = { key, values };
    $('progress').textContent = t(key, values);
  };
  setBusy(true);
  updateProgress('processingLocal');
  try {
    result = await convert(source, config.outputType, config.strength, targetBytes, targetBytes ? null : cached, controller.signal, updateProgress, options, $('remove-metadata').checked);
    applyOutputName(result);
    const { image, keepOriginal } = result;
    if (image) { imageCache = image; renderSettings(); }
    renderResult();
    $('download').focus({ preventScroll: true });
    try {
      if ((config.outputType === 'application/pdf' || config.outputType.startsWith('image/')) && (config.isPdf || source.type.startsWith('image/'))
        && source.size <= MAX_ESTIMATE_SIZE && result.blob.size <= MAX_ESTIMATE_SIZE) {
        const original = config.isPdf ? await pdfPreview(source, controller.signal) : source;
        controller.signal.throwIfAborted();
        const converted = keepOriginal ? original : config.outputType === 'application/pdf' ? await pdfPreview(result.blob, controller.signal) : result.blob;
        controller.signal.throwIfAborted();
        for (const [id, blob] of [['original-preview', original], ['result-preview', converted]]) {
          const url = URL.createObjectURL(blob);
          previewUrls.push(url);
          $(id).src = url;
        }
        $('preview').hidden = false;
      } else if ((config.isPdf || source.type.startsWith('image/')) && (source.size > MAX_ESTIMATE_SIZE || result.blob.size > MAX_ESTIMATE_SIZE)) {
        $('preview-error').hidden = false;
      }
    } catch (error) {
      if (!controller.signal.aborted) $('preview-error').hidden = false;
    }
  } catch (error) {
    if (!controller.signal.aborted) {
      showError(error instanceof Error ? error.message : t('processingError'));
      estimateData = { key: 'noEstimate' };
      renderEstimate();
    }
  } finally {
    if (operation === controller) { operation = null; setBusy(false); }
  }
});

$('download').addEventListener('click', () => {
  if (!result || $('download').disabled) return;
  try { applyOutputName(result); }
  catch (error) { return showError(error.message); }
  const current = result;
  downloadResult(result);
  downloadStarted = true;
  $('download').disabled = true;
  $('download-status').hidden = false;
  renderResult();
  downloadTimer = setTimeout(() => {
    if (result !== current) return;
    $('download').disabled = false;
    renderResult();
  }, 2000);
});

const extensionApi = globalThis.browser ?? globalThis.chrome;
extensionApi?.runtime?.onMessage?.addListener((message) => {
  if (message?.type === 'locoVerteSourceTab' && Number.isInteger(message.tabId)) {
    uploadTabId = message.tabId;
    if (result) renderResult();
  }
});

$('upload-field').addEventListener('click', async () => {
  if (!result || !uploadTabId) return;
  try { applyOutputName(result); }
  catch (error) { return showError(error.message); }
  const status = $('upload-status');
  status.hidden = false;
  if (result.blob.size > 2 * 1024 ** 2) { status.textContent = t('uploadTooLarge'); return; }
  const api = globalThis.browser ?? globalThis.chrome;
  if (!api?.scripting?.executeScript) { status.textContent = t('uploadUnavailable'); return; }
  $('upload-field').disabled = true;
  try {
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(',')[1]);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(result.blob);
    });
    const filename = outputFilename(result);
    const [{ result: filled }] = await api.scripting.executeScript({
      target: { tabId: uploadTabId },
      func: fillUploadField,
      args: [base64, filename, result.blob.type],
    });
    status.textContent = t(filled ? 'uploadDone' : 'uploadNoField');
    if (filled) {
      try { await api.tabs.update(uploadTabId, { active: true }); }
      catch { /* The file was inserted; switching tabs is only a convenience. */ }
    }
  } catch { status.textContent = t('uploadFailed'); }
  finally { $('upload-field').disabled = false; }
});

initPreferences(render, showError);
render();
