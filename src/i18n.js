export const messages = {
  en: {
    officePdfNotice: 'Local PDF with reflowed text as image pages. Layout, images, formulas and slide graphics may be lost; text is not searchable.',
    mediaNotice: 'Local conversion; available codecs depend on this browser.',
    mediaWarning: 'Strong settings can noticeably reduce sound and picture quality.',
    mediaCodecUnavailable: 'This browser cannot encode this format locally.',
    mediaReadError: 'This browser cannot read or convert this media file.',
    mediaProgress: 'Converting locally · {percent} %',
    firstFrameNotice: 'Only the first GIF frame or TIFF page is converted.',
    heicNotice: 'HEIC requires native support in this browser; no file is uploaded.',
    heicUnavailable: 'This browser cannot decode HEIC locally.',
    imageReadError: 'This image could not be decoded locally.',
    zipTooLarge: 'The image archive would exceed 512 MB. Use fewer pages or JPEG.',
    mediaOutputTooLarge: 'The converted media would exceed 1 GB. Try stronger compression or a shorter clip.',
    mergePdf: 'Combine images into one PDF', mergedPdfName: 'combined-images.pdf', pdfImageNotice: 'Each PDF page becomes an image in a ZIP; text and links are not retained.',
    addFiles: 'Add more files', batchTitle: 'Files', batchCount: '{count} files', batchProcess: 'Process all locally', batchProgress: '{current}/{total} · {name}', batchReady: 'Ready', batchWorking: 'Processing…', batchDone: 'Ready to download', batchFailed: 'Could not process', batchDownload: 'Download', batchDownloadStarted: 'Started ✓', batchLimit: 'Up to 20 files at a time.', batchPdfNotice: 'PDF optimization may create image-only pages.',
    estimateTitle: 'Estimated size', estimateKeepOriginal: 'If larger, the original is kept.', estimateFirstPage: 'Rough estimate from page 1.', estimateResolution: 'Resolution: {width} × {height} px',
    convertedSuffix: '-converted',
    convertedResult: '{original} → {result}.{target}',
    officeReadError: 'This Office file is damaged, protected or too complex to read locally.',
    docxNotice: 'TXT only · formatting, tables and images are lost.',
    xlsxNotice: 'First sheet as CSV · no formatting or formulas.',
    officeResultWarning: ' Content only; layout is not preserved.',
    pdfTextNotice: 'Selectable text only · no layout or images. Scans need OCR.',
    pdfTextResult: ' Only selectable text; no layout or images.',
    pdfNoText: 'This PDF has no selectable text. Scanned pages need OCR, which is not available yet.',
    audioQualityNotice: 'WAV is uncompressed. Stronger settings lower the sample rate; MP3 → WAV often grows.',
    audioWarning: 'A low sample rate and mono audio may noticeably reduce sound quality.',
    audioTooLong: 'The decoded audio is too long for the current memory limit.',
    audioDecodeError: 'This browser cannot decode the audio file.',
    replaceFile: 'Choose another file', cancel: 'Cancel', targetHelp: 'Reaching the target may lower quality.', targetAdjusted: ' Lower quality was used for the target.', previewFailed: 'Preview unavailable. You can still download the result.',
    appName: 'Local Converter', eyebrow: 'PRIVATE · OFFLINE', intro: 'Convert and optimize files locally.', languageButton: 'Language: {language}', autoLanguage: 'Automatic', languageSaveError: 'Could not save the language choice in this browser.', themeButton: 'Color theme: {theme}', autoTheme: 'Automatic', lightTheme: 'Light', darkTheme: 'Dark', themeSaveError: 'Could not save the theme choice in this browser.',
    chooseFile: 'Choose a file', dropFile: 'Drop a file here', orChoose: 'or click to choose', supportedFormats: 'Images, PDF, audio, video and Office', removeFile: 'Remove file',
    compressionStrength: 'Compression strength', gentle: 'Gentle', balanced: 'Balanced', strong: 'Strong', gentleHint: 'Gentle · high quality', strongHint: 'Strong · lower quality',
    qualityMuchLower: 'Quality: much lower',
    outputFormat: 'Output format', pngLossless: 'PNG (lossless)', targetSize: 'Target size (MB, optional)', targetPlaceholder: 'e.g. 2.5',
    process: 'Process locally', processing: 'Processing…', download: 'Download result', downloadStarted: 'Download started ✓', downloadAgain: 'Download again', downloadStatus: 'Download started. Check your Downloads folder.',
    original: 'Original', result: 'Result', originalPreview: 'Original file preview', resultPreview: 'Result preview', footer: 'Your files stay on your device.', opening: 'Opening converter…', openingFailed: 'Could not open the window. Please reload the extension.',
    pdfWarning: 'Strong compression may blur pages.',
    pngWarning: 'Strong compression reduces resolution and fine details.',
    imageWarning: 'Strong compression may blur details and text.',
    pdfOriginalNotice: 'Original PDF remains unchanged.',
    pdfRasterNotice: 'Image PDF · text search, links, forms, vectors and signatures are lost.',
    calculating: 'Calculating size…',
    largePdfEstimate: 'Size shown after processing (over 30 MB).', largeImageEstimate: 'Size shown after processing (over 30 MB).',
    noEstimate: 'Size shown after processing.',
    unsupported: 'This format is not supported yet.', emptyFile: 'The file is empty. Please choose another file.', fileTooLarge: 'This file exceeds the {limit} MB local input limit.', imageKind: 'IMAGE',
    imageEncodeError: 'The browser could not encode the image.', pdfPassword: 'Password-protected PDFs cannot be processed.', pdfReadError: 'The PDF is damaged or cannot be read in this browser.',
    pdfJpegError: 'This browser could not encode the PDF page as JPEG.', cancelled: 'Processing cancelled.', canvasMemory: 'Not enough graphics memory is available for this PDF page.',
    pageProgress: 'Processing page {page} of {total}…', tooManyPages: 'PDFs over 1,000 pages cannot currently be processed.', variantProgress: 'Calculating version {index} of {total}…',
    invalidTarget: 'Enter a valid target size in MB.', processingLocal: 'Processing the file locally…',
    targetMissed: ' Target not reached.', savedResult: '{original} → {result} · −{percent}%.{target}', convertedLarger: 'Converted: {result}. The selected format is larger than the original.{target}',
    noSmallerResult: 'No saving · original kept.{onePixel}{target}', onePixelResult: ' Image is only 1 × 1 px.',
    pdfResultWarning: ' Image PDF: no text search or forms.',
    actualSaving: 'Actual saving: {percent}%. Result: {result}.', actualNoSaving: 'Actual saving: none. Result: {result}.', processingError: 'The file could not be processed.',
    fileSuffix: '-compressed',
  },
  de: {
    officePdfNotice: 'Lokales PDF mit neu gesetztem Text als Bildseiten. Layout, Bilder, Formeln und Foliengrafiken können entfallen; Text ist nicht durchsuchbar.',
    mediaNotice: 'Lokale Umwandlung; verfügbare Codecs hängen vom Browser ab.',
    mediaWarning: 'Starke Einstellungen können Klang und Bild deutlich verschlechtern.',
    mediaCodecUnavailable: 'Dieser Browser kann dieses Format lokal nicht kodieren.',
    mediaReadError: 'Dieser Browser kann diese Mediendatei nicht lokal lesen oder umwandeln.',
    mediaProgress: 'Lokale Umwandlung · {percent} %',
    firstFrameNotice: 'Nur das erste GIF-Bild bzw. die erste TIFF-Seite wird konvertiert.',
    heicNotice: 'HEIC braucht native Browser-Unterstützung; es erfolgt kein Upload.',
    heicUnavailable: 'Dieser Browser kann HEIC lokal nicht dekodieren.',
    imageReadError: 'Dieses Bild konnte lokal nicht dekodiert werden.',
    zipTooLarge: 'Das Bildarchiv würde 512 MB überschreiten. Weniger Seiten oder JPEG wählen.',
    mediaOutputTooLarge: 'Das umgewandelte Medium würde 1 GB überschreiten. Stärker komprimieren oder kürzeren Ausschnitt wählen.',
    mergePdf: 'Bilder zu einem PDF verbinden', mergedPdfName: 'bilder-zusammengefasst.pdf', pdfImageNotice: 'Jede PDF-Seite wird als Bild im ZIP exportiert; Text und Links entfallen.',
    addFiles: 'Weitere Dateien hinzufügen', batchTitle: 'Dateien', batchCount: '{count} Dateien', batchProcess: 'Alle lokal verarbeiten', batchProgress: '{current}/{total} · {name}', batchReady: 'Bereit', batchWorking: 'Wird verarbeitet …', batchDone: 'Download bereit', batchFailed: 'Nicht verarbeitet', batchDownload: 'Herunterladen', batchDownloadStarted: 'Gestartet ✓', batchLimit: 'Bis zu 20 Dateien gleichzeitig.', batchPdfNotice: 'PDF-Optimierung kann reine Bildseiten erzeugen.',
    estimateTitle: 'Voraussichtlich', estimateKeepOriginal: 'Falls größer: Original bleibt.', estimateFirstPage: 'Grobe Schätzung aus Seite 1.', estimateResolution: 'Auflösung: {width} × {height} px',
    convertedSuffix: '-konvertiert',
    convertedResult: '{original} → {result}.{target}',
    officeReadError: 'Diese Office-Datei ist beschädigt, geschützt oder lokal nicht lesbar.',
    docxNotice: 'Nur TXT · Formatierung, Tabellen und Bilder entfallen.',
    xlsxNotice: 'Erstes Blatt als CSV · ohne Formatierung und Formeln.',
    officeResultWarning: ' Nur Inhalt; Layout entfällt.',
    pdfTextNotice: 'Nur auswählbarer Text · kein Layout oder Bilder. Scans brauchen OCR.',
    pdfTextResult: ' Nur auswählbarer Text; kein Layout oder Bilder.',
    pdfNoText: 'Dieses PDF enthält keinen auswählbaren Text. Für Scans wäre OCR nötig; das ist noch nicht verfügbar.',
    audioQualityNotice: 'WAV ist unkomprimiert. Stärker senkt die Abtastrate; MP3 → WAV wird oft größer.',
    audioWarning: 'Eine niedrige Abtastrate und Mono können den Klang deutlich verschlechtern.',
    audioTooLong: 'Die Audiodatei ist für die aktuelle Speichergrenze zu lang.',
    audioDecodeError: 'Dieser Browser kann die Audiodatei nicht dekodieren.',
    replaceFile: 'Andere Datei auswählen', cancel: 'Abbrechen', targetHelp: 'Die Zielgröße kann Qualität kosten.', targetAdjusted: ' Für die Zielgröße wurde Qualität reduziert.', previewFailed: 'Vorschau nicht verfügbar. Download ist trotzdem möglich.',
    appName: 'Lokal Konverter', eyebrow: 'PRIVAT · OFFLINE', intro: 'Dateien lokal konvertieren und optimieren.', languageButton: 'Sprache: {language}', autoLanguage: 'Automatisch', languageSaveError: 'Die Sprachauswahl konnte in diesem Browser nicht gespeichert werden.', themeButton: 'Farbschema: {theme}', autoTheme: 'Automatisch', lightTheme: 'Hell', darkTheme: 'Dunkel', themeSaveError: 'Das Farbschema konnte in diesem Browser nicht gespeichert werden.',
    chooseFile: 'Datei auswählen', dropFile: 'Datei hier ablegen', orChoose: 'oder klicken zum Auswählen', supportedFormats: 'Bilder, PDF, Audio, Video und Office', removeFile: 'Datei entfernen',
    compressionStrength: 'Komprimierungsstärke', gentle: 'Schonend', balanced: 'Ausgewogen', strong: 'Stark', gentleHint: 'Schonend · hohe Qualität', strongHint: 'Stark · weniger Qualität',
    qualityMuchLower: 'Qualität: deutlich geringer',
    outputFormat: 'Ausgabeformat', pngLossless: 'PNG (verlustfrei)', targetSize: 'Zielgröße (MB, optional)', targetPlaceholder: 'z. B. 2,5',
    process: 'Lokal verarbeiten', processing: 'Verarbeitung läuft …', download: 'Ergebnis herunterladen', downloadStarted: 'Download gestartet ✓', downloadAgain: 'Erneut herunterladen', downloadStatus: 'Download gestartet. Prüfe deinen Downloads-Ordner.',
    original: 'Original', result: 'Ergebnis', originalPreview: 'Vorschau der Originaldatei', resultPreview: 'Vorschau des Ergebnisses', footer: 'Deine Dateien bleiben auf deinem Gerät.', opening: 'Konverter wird geöffnet …', openingFailed: 'Fenster konnte nicht geöffnet werden. Bitte Erweiterung neu laden.',
    pdfWarning: 'Starke Komprimierung kann Seiten unscharf machen.',
    pngWarning: 'Starke Komprimierung senkt Auflösung und Details.',
    imageWarning: 'Starke Komprimierung kann Details und Text verwischen.',
    pdfOriginalNotice: 'Original-PDF bleibt unverändert.',
    pdfRasterNotice: 'Bild-PDF · Textsuche, Links, Formulare, Vektoren und Signaturen entfallen.',
    calculating: 'Berechne Größe…',
    largePdfEstimate: 'Größe nach Verarbeitung sichtbar (über 30 MB).', largeImageEstimate: 'Größe nach Verarbeitung sichtbar (über 30 MB).',
    noEstimate: 'Größe nach Verarbeitung sichtbar.',
    unsupported: 'Dieses Format wird im MVP noch nicht unterstützt.', emptyFile: 'Die Datei ist leer. Bitte eine andere Datei wählen.', fileTooLarge: 'Diese Datei überschreitet die lokale Eingabegrenze von {limit} MB.', imageKind: 'BILD',
    imageEncodeError: 'Der Browser konnte das Bild nicht kodieren.', pdfPassword: 'Passwortgeschützte PDFs werden nicht verarbeitet.', pdfReadError: 'Die PDF ist beschädigt oder kann in diesem Browser nicht gelesen werden.',
    pdfJpegError: 'Dieser Browser konnte die PDF-Seite nicht als JPEG kodieren.', cancelled: 'Verarbeitung abgebrochen.', canvasMemory: 'Für diese PDF-Seite ist nicht genug Grafikspeicher verfügbar.',
    pageProgress: 'Seite {page} von {total} wird verarbeitet …', tooManyPages: 'PDFs mit mehr als 1.000 Seiten werden derzeit nicht verarbeitet.', variantProgress: 'Variante {index} von {total} wird berechnet …',
    invalidTarget: 'Bitte eine gültige Zielgröße in MB eingeben.', processingLocal: 'Datei wird lokal verarbeitet …',
    targetMissed: ' Zielgröße verfehlt.', savedResult: '{original} → {result} · −{percent} %.{target}', convertedLarger: 'Konvertiert: {result}. Das gewählte Format ist größer als das Original.{target}',
    noSmallerResult: 'Keine Einsparung · Original bleibt.{onePixel}{target}', onePixelResult: ' Bild hat nur 1 × 1 px.',
    pdfResultWarning: ' Bild-PDF: keine Textsuche oder Formulare.',
    actualSaving: 'Tatsächliche Einsparung: {percent} %. Ergebnis: {result}.', actualNoSaving: 'Tatsächliche Einsparung: keine. Ergebnis: {result}.', processingError: 'Die Datei konnte nicht verarbeitet werden.',
    fileSuffix: '-komprimiert',
  },
  es: {
    officePdfNotice: 'PDF local con texto como páginas de imagen. Pueden perderse diseño, imágenes, fórmulas y gráficos; el texto no se puede buscar.',
    mediaNotice: 'Conversión local; los códecs dependen del navegador.',
    mediaWarning: 'Los ajustes fuertes pueden reducir notablemente sonido e imagen.',
    mediaCodecUnavailable: 'Este navegador no puede codificar este formato localmente.',
    mediaReadError: 'Este navegador no puede leer o convertir este archivo multimedia.',
    mediaProgress: 'Conversión local · {percent} %',
    firstFrameNotice: 'Solo se convierte el primer fotograma GIF o página TIFF.',
    heicNotice: 'HEIC requiere compatibilidad nativa del navegador; no se sube el archivo.',
    heicUnavailable: 'Este navegador no puede decodificar HEIC localmente.',
    imageReadError: 'No se pudo decodificar esta imagen localmente.',
    zipTooLarge: 'El archivo de imágenes superaría 512 MB. Usa menos páginas o JPEG.',
    mediaOutputTooLarge: 'El archivo convertido superaría 1 GB. Usa más compresión o un clip más corto.',
    mergePdf: 'Unir imágenes en un PDF', mergedPdfName: 'imagenes-combinadas.pdf', pdfImageNotice: 'Cada página PDF se exporta como imagen en un ZIP; se pierden texto y enlaces.',
    addFiles: 'Añadir más archivos', batchTitle: 'Archivos', batchCount: '{count} archivos', batchProcess: 'Procesar todos localmente', batchProgress: '{current}/{total} · {name}', batchReady: 'Listo', batchWorking: 'Procesando…', batchDone: 'Listo para descargar', batchFailed: 'No procesado', batchDownload: 'Descargar', batchDownloadStarted: 'Iniciada ✓', batchLimit: 'Hasta 20 archivos a la vez.', batchPdfNotice: 'La optimización de PDF puede crear páginas solo de imagen.',
    estimateTitle: 'Tamaño estimado', estimateKeepOriginal: 'Si es mayor, se conserva el original.', estimateFirstPage: 'Estimación aproximada de la página 1.', estimateResolution: 'Resolución: {width} × {height} px',
    convertedSuffix: '-convertido',
    convertedResult: '{original} → {result}.{target}',
    officeReadError: 'Este archivo de Office está dañado, protegido o es demasiado complejo para leerlo localmente.',
    docxNotice: 'Solo TXT · se pierden formato, tablas e imágenes.',
    xlsxNotice: 'Primera hoja como CSV · sin formato ni fórmulas.',
    officeResultWarning: ' Solo contenido; no se conserva el diseño.',
    pdfTextNotice: 'Solo texto seleccionable · sin diseño ni imágenes. Los escaneos necesitan OCR.',
    pdfTextResult: ' Solo texto seleccionable; sin diseño ni imágenes.',
    pdfNoText: 'Este PDF no contiene texto seleccionable. Los escaneos necesitan OCR, que aún no está disponible.',
    audioQualityNotice: 'WAV no está comprimido. Un ajuste fuerte reduce la frecuencia; MP3 → WAV suele crecer.',
    audioWarning: 'Una frecuencia de muestreo baja y el sonido mono pueden reducir notablemente la calidad.',
    audioTooLong: 'El audio decodificado supera el límite de memoria actual.',
    audioDecodeError: 'Este navegador no puede decodificar el archivo de audio.',
    replaceFile: 'Seleccionar otro archivo', cancel: 'Cancelar', targetHelp: 'Alcanzar el objetivo puede reducir la calidad.', targetAdjusted: ' Se redujo la calidad para el tamaño objetivo.', previewFailed: 'Vista previa no disponible. Puedes descargar el resultado.',
    appName: 'Conversor local', eyebrow: 'PRIVADO · SIN CONEXIÓN', intro: 'Convierte y optimiza archivos localmente.', languageButton: 'Idioma: {language}', autoLanguage: 'Automático', languageSaveError: 'No se pudo guardar el idioma elegido en este navegador.', themeButton: 'Tema de color: {theme}', autoTheme: 'Automático', lightTheme: 'Claro', darkTheme: 'Oscuro', themeSaveError: 'No se pudo guardar el tema en este navegador.',
    chooseFile: 'Seleccionar archivo', dropFile: 'Suelta un archivo aquí', orChoose: 'o haz clic para seleccionar', supportedFormats: 'Imágenes, PDF, audio, vídeo y Office', removeFile: 'Quitar archivo',
    compressionStrength: 'Intensidad de compresión', gentle: 'Suave', balanced: 'Equilibrada', strong: 'Alta', gentleHint: 'Suave · alta calidad', strongHint: 'Alta · menor calidad',
    qualityMuchLower: 'Calidad: mucho menor',
    outputFormat: 'Formato de salida', pngLossless: 'PNG (sin pérdida)', targetSize: 'Tamaño objetivo (MB, opcional)', targetPlaceholder: 'p. ej., 2,5',
    process: 'Procesar localmente', processing: 'Procesando…', download: 'Descargar resultado', downloadStarted: 'Descarga iniciada ✓', downloadAgain: 'Descargar de nuevo', downloadStatus: 'Descarga iniciada. Revisa tu carpeta de descargas.',
    original: 'Original', result: 'Resultado', originalPreview: 'Vista previa del archivo original', resultPreview: 'Vista previa del resultado', footer: 'Tus archivos permanecen en tu dispositivo.', opening: 'Abriendo conversor…', openingFailed: 'No se pudo abrir la ventana. Vuelve a cargar la extensión.',
    pdfWarning: 'La compresión fuerte puede desenfocar las páginas.',
    pngWarning: 'La compresión fuerte reduce resolución y detalles.',
    imageWarning: 'La compresión fuerte puede desenfocar detalles y texto.',
    pdfOriginalNotice: 'El PDF original no cambia.',
    pdfRasterNotice: 'PDF de imagen · se pierden búsqueda, enlaces, formularios, vectores y firmas.',
    calculating: 'Calculando tamaño…',
    largePdfEstimate: 'Tamaño visible tras procesar (más de 30 MB).', largeImageEstimate: 'Tamaño visible tras procesar (más de 30 MB).',
    noEstimate: 'Tamaño visible tras procesar.',
    unsupported: 'Este formato todavía no es compatible.', emptyFile: 'El archivo está vacío. Selecciona otro.', fileTooLarge: 'Este archivo supera el límite local de {limit} MB.', imageKind: 'IMAGEN',
    imageEncodeError: 'El navegador no pudo codificar la imagen.', pdfPassword: 'No se pueden procesar PDF protegidos con contraseña.', pdfReadError: 'El PDF está dañado o no se puede leer en este navegador.',
    pdfJpegError: 'Este navegador no pudo codificar la página del PDF como JPEG.', cancelled: 'Procesamiento cancelado.', canvasMemory: 'No hay suficiente memoria gráfica para esta página del PDF.',
    pageProgress: 'Procesando página {page} de {total}…', tooManyPages: 'Actualmente no se pueden procesar PDF de más de 1.000 páginas.', variantProgress: 'Calculando versión {index} de {total}…',
    invalidTarget: 'Introduce un tamaño objetivo válido en MB.', processingLocal: 'Procesando el archivo localmente…',
    targetMissed: ' No se alcanzó el tamaño objetivo.', savedResult: '{original} → {result} · −{percent} %.{target}', convertedLarger: 'Convertido: {result}. El formato elegido es más grande que el original.{target}',
    noSmallerResult: 'Sin ahorro · se conserva el original.{onePixel}{target}', onePixelResult: ' Imagen de solo 1 × 1 px.',
    pdfResultWarning: ' PDF de imagen: sin búsqueda ni formularios.',
    actualSaving: 'Ahorro real: {percent} %. Resultado: {result}.', actualNoSaving: 'Ahorro real: ninguno. Resultado: {result}.', processingError: 'No se pudo procesar el archivo.',
    fileSuffix: '-comprimido',
  },
  fr: {
    officePdfNotice: 'PDF local avec texte en pages image. Mise en page, images, formules et graphiques peuvent être perdus ; texte non consultable.',
    mediaNotice: 'Conversion locale ; les codecs dépendent du navigateur.',
    mediaWarning: 'Des réglages forts peuvent dégrader nettement son et image.',
    mediaCodecUnavailable: 'Ce navigateur ne peut pas encoder ce format localement.',
    mediaReadError: 'Ce navigateur ne peut pas lire ou convertir ce média localement.',
    mediaProgress: 'Conversion locale · {percent} %',
    firstFrameNotice: 'Seule la première image GIF ou page TIFF est convertie.',
    heicNotice: 'HEIC exige une prise en charge native du navigateur ; aucun envoi.',
    heicUnavailable: 'Ce navigateur ne peut pas décoder HEIC localement.',
    imageReadError: 'Cette image ne peut pas être décodée localement.',
    zipTooLarge: 'L’archive d’images dépasserait 512 Mo. Réduisez les pages ou choisissez JPEG.',
    mediaOutputTooLarge: 'Le média converti dépasserait 1 Go. Compressez davantage ou choisissez un extrait plus court.',
    mergePdf: 'Réunir les images en un PDF', mergedPdfName: 'images-assemblees.pdf', pdfImageNotice: 'Chaque page PDF devient une image dans un ZIP ; texte et liens sont perdus.',
    addFiles: 'Ajouter des fichiers', batchTitle: 'Fichiers', batchCount: '{count} fichiers', batchProcess: 'Tout traiter localement', batchProgress: '{current}/{total} · {name}', batchReady: 'Prêt', batchWorking: 'Traitement…', batchDone: 'Prêt à télécharger', batchFailed: 'Non traité', batchDownload: 'Télécharger', batchDownloadStarted: 'Lancé ✓', batchLimit: 'Jusqu’à 20 fichiers à la fois.', batchPdfNotice: 'L’optimisation PDF peut créer des pages image.',
    estimateTitle: 'Taille estimée', estimateKeepOriginal: 'Si plus grand, l’original est conservé.', estimateFirstPage: 'Estimation approximative depuis la page 1.', estimateResolution: 'Résolution : {width} × {height} px',
    convertedSuffix: '-converti',
    convertedResult: '{original} → {result}.{target}',
    officeReadError: 'Ce fichier Office est endommagé, protégé ou trop complexe pour une lecture locale.',
    docxNotice: 'TXT seul · mise en forme, tableaux et images perdus.',
    xlsxNotice: 'Première feuille en CSV · sans mise en forme ni formules.',
    officeResultWarning: ' Contenu seul ; mise en page perdue.',
    pdfTextNotice: 'Texte sélectionnable seul · sans mise en page ni images. Les scans nécessitent un OCR.',
    pdfTextResult: ' Texte sélectionnable seul ; sans mise en page ni images.',
    pdfNoText: 'Ce PDF ne contient pas de texte sélectionnable. Les scans nécessitent un OCR, pas encore disponible.',
    audioQualityNotice: 'WAV est non compressé. Un réglage fort réduit la fréquence ; MP3 → WAV grossit souvent.',
    audioWarning: 'Une faible fréquence d’échantillonnage et le mono peuvent nettement dégrader le son.',
    audioTooLong: 'Le fichier audio décodé dépasse la limite de mémoire actuelle.',
    audioDecodeError: 'Ce navigateur ne peut pas décoder ce fichier audio.',
    replaceFile: 'Choisir un autre fichier', cancel: 'Annuler', targetHelp: 'Atteindre la cible peut réduire la qualité.', targetAdjusted: ' Qualité réduite pour atteindre la cible.', previewFailed: 'Aperçu indisponible. Téléchargement possible.',
    appName: 'Convertisseur local', eyebrow: 'PRIVÉ · HORS LIGNE', intro: 'Convertissez et optimisez vos fichiers localement.', languageButton: 'Langue : {language}', autoLanguage: 'Automatique', languageSaveError: 'Impossible d’enregistrer la langue choisie dans ce navigateur.', themeButton: 'Thème de couleurs : {theme}', autoTheme: 'Automatique', lightTheme: 'Clair', darkTheme: 'Sombre', themeSaveError: 'Impossible d’enregistrer le thème dans ce navigateur.',
    chooseFile: 'Choisir un fichier', dropFile: 'Déposez un fichier ici', orChoose: 'ou cliquez pour choisir', supportedFormats: 'Images, PDF, audio, vidéo et Office', removeFile: 'Supprimer le fichier',
    compressionStrength: 'Intensité de compression', gentle: 'Douce', balanced: 'Équilibrée', strong: 'Forte', gentleHint: 'Douce · qualité élevée', strongHint: 'Forte · qualité réduite',
    qualityMuchLower: 'Qualité : nettement réduite',
    outputFormat: 'Format de sortie', pngLossless: 'PNG (sans perte)', targetSize: 'Taille cible (Mo, facultatif)', targetPlaceholder: 'p. ex. 2,5',
    process: 'Traiter localement', processing: 'Traitement en cours…', download: 'Télécharger le résultat', downloadStarted: 'Téléchargement lancé ✓', downloadAgain: 'Télécharger à nouveau', downloadStatus: 'Téléchargement lancé. Vérifiez votre dossier Téléchargements.',
    original: 'Original', result: 'Résultat', originalPreview: 'Aperçu du fichier original', resultPreview: 'Aperçu du résultat', footer: 'Vos fichiers restent sur votre appareil.', opening: 'Ouverture du convertisseur…', openingFailed: 'Impossible d’ouvrir la fenêtre. Rechargez l’extension.',
    pdfWarning: 'Une forte compression peut rendre les pages floues.',
    pngWarning: 'Une forte compression réduit résolution et détails.',
    imageWarning: 'Une forte compression peut flouter détails et texte.',
    pdfOriginalNotice: 'PDF original inchangé.',
    pdfRasterNotice: 'PDF image · recherche, liens, formulaires, vecteurs et signatures perdus.',
    calculating: 'Calcul de la taille…',
    largePdfEstimate: 'Taille affichée après traitement (plus de 30 Mo).', largeImageEstimate: 'Taille affichée après traitement (plus de 30 Mo).',
    noEstimate: 'Taille affichée après traitement.',
    unsupported: 'Ce format n’est pas encore pris en charge.', emptyFile: 'Le fichier est vide. Choisissez-en un autre.', fileTooLarge: 'Ce fichier dépasse la limite locale de {limit} Mo.', imageKind: 'IMAGE',
    imageEncodeError: 'Le navigateur n’a pas pu encoder l’image.', pdfPassword: 'Les PDF protégés par mot de passe ne peuvent pas être traités.', pdfReadError: 'Le PDF est endommagé ou illisible dans ce navigateur.',
    pdfJpegError: 'Ce navigateur n’a pas pu encoder la page PDF en JPEG.', cancelled: 'Traitement annulé.', canvasMemory: 'La mémoire graphique est insuffisante pour cette page PDF.',
    pageProgress: 'Traitement de la page {page} sur {total}…', tooManyPages: 'Les PDF de plus de 1 000 pages ne peuvent pas être traités actuellement.', variantProgress: 'Calcul de la version {index} sur {total}…',
    invalidTarget: 'Saisissez une taille cible valide en Mo.', processingLocal: 'Traitement local du fichier…',
    targetMissed: ' Cible non atteinte.', savedResult: '{original} → {result} · −{percent} %.{target}', convertedLarger: 'Converti : {result}. Le format choisi est plus volumineux que l’original.{target}',
    noSmallerResult: 'Aucun gain · original conservé.{onePixel}{target}', onePixelResult: ' Image de 1 × 1 px.',
    pdfResultWarning: ' PDF image : sans recherche ni formulaires.',
    actualSaving: 'Gain réel : {percent} %. Résultat : {result}.', actualNoSaving: 'Gain réel : aucun. Résultat : {result}.', processingError: 'Impossible de traiter le fichier.',
    fileSuffix: '-compresse',
  },
};

Object.assign(messages.en, {
  removeMetadata: 'Remove metadata', removeMetadataHelp: 'Removes embedded author, location, device and editing data.', removeMetadataPdfWarning: 'PDF pages are rebuilt as images to remove metadata reliably. Search, links, forms and signatures are lost.', metadataRemovedResult: ' Metadata removed.', metadataRemovalFailed: 'Metadata could not be removed reliably from this file.',
  pdfPagesOne: '1 page', pdfOutputTooLarge: 'The resulting PDF would exceed 512 MB.',
  pasteImage: 'Add image from clipboard', clipboardPasteHint: 'Clipboard access was blocked. Click here and press Ctrl/Cmd+V instead.', clipboardNoImage: 'No PNG, JPEG or WebP image found in the clipboard.',
  pdfPagesTitle: 'Edit PDF pages', pdfPagesHelp: 'Reorder, rotate, remove or extract pages. The original stays unchanged.', pdfPagesLoading: 'Reading pages locally…', pdfPagesCount: '{count} pages', pdfPageLabel: 'Page {number}', pdfPageSelect: 'Select page {number}', pdfPageUp: 'Move page {number} up', pdfPageDown: 'Move page {number} down', pdfPageRotate: 'Rotate page {number} right', pdfPageRemove: 'Remove page {number}', pdfPagesSave: 'Download edited PDF', pdfPagesExtract: 'Download selected pages', pdfPagesReset: 'Reset pages', pdfPagesDone: 'PDF download started ✓', pdfPagesEmpty: 'Keep at least one page.', pdfPagesNoneSelected: 'Select at least one page.', pdfPagesInvalid: 'The page selection is invalid.', pdfPagesUnsafe: 'This PDF has interactive features or signatures. Page editing could lose them, so it is blocked.', pdfMergeLimit: 'Combine 2 or more PDFs with at most 512 MB total.', mergePdfs: 'Combine PDFs', mergedPdfsName: 'combined-pdfs.pdf',
  dropFilesHere: 'Drop files anywhere here',
  adjustedResult: 'Adjusted: {original} → {result}.{target}',
  outputWidth: 'Width (px)', outputHeight: 'Height (px)', dimensionsHelp: 'One value keeps proportions; two values add padding if needed.', squareMode: 'Square', squareNone: 'No', squarePad: 'Fit without cropping', backgroundColor: 'Background color', backgroundFill: 'Fill', invalidOutputDimensions: 'Use 1–16000 px per side and at most 40 megapixels.', conflictingDimensions: 'Use either longest edge or width and height.', invalidSquareDimensions: 'For square output, width and height must match.',
  pdfAdjust: 'Adjust PDF', targetSizeSummary: 'Target {size} MB', renamedSummary: 'Renamed', outputName: 'File name (optional, without extension)', outputNamePlaceholder: 'Keep suggested name', invalidOutputName: 'Enter a valid file name without slashes or special characters.',
  imageAdjust: 'Adjust image', maxDimension: 'Longest edge (px)', autoSize: 'Auto', rotate: 'Rotate', noRotation: 'No rotation', squareCrop: 'Center crop to square',
  invalidCrop: 'Invalid image dimensions or crop.', invalidDimension: 'Enter a longest edge between 1 and 16000 px.',
  targetReached: 'Target met.', targetNotReached: 'Target not met; best local result shown.',
  pdfComplexKept: 'This PDF may contain forms or signatures; original kept.', pdfNoStructuralSaving: 'No safe PDF saving; original kept.', pdfLargeKept: 'Large PDF kept unchanged to protect memory.', pdfStructureNotice: 'Keeps selectable text and vector pages where possible. Signed or interactive PDFs stay unchanged.',
  downloadZip: 'Download all as ZIP', zipNoResults: 'Process at least one file first.', zipPartial: '{count} of {total} results included; failed files were skipped.', zipStarted: 'ZIP download started ✓',
  useInUpload: 'Use in upload field', uploadWarning: 'The website may upload the file immediately after insertion.', uploadUnavailable: 'Available only as an installed extension on a normal web page.', uploadTooLarge: 'For direct upload, the result must be 2 MB or smaller. Download it instead.', uploadNoField: 'No compatible file field found on the original page. Download and select the file there.', uploadDone: 'File inserted into the upload field. Check the form before submitting.', uploadFailed: 'Could not fill the upload field. Download and select the file manually.',
});
Object.assign(messages.de, {
  removeMetadata: 'Metadaten entfernen', removeMetadataHelp: 'Entfernt eingebettete Angaben zu Autor, Standort, Gerät und Bearbeitung.', removeMetadataPdfWarning: 'PDF-Seiten werden für eine zuverlässige Bereinigung als Bilder neu aufgebaut. Suche, Links, Formulare und Signaturen gehen verloren.', metadataRemovedResult: ' Metadaten entfernt.', metadataRemovalFailed: 'Die Metadaten konnten aus dieser Datei nicht zuverlässig entfernt werden.',
  pdfPagesOne: '1 Seite', pdfOutputTooLarge: 'Das Ergebnis-PDF würde 512 MB überschreiten.',
  pasteImage: 'Bild aus Zwischenablage hinzufügen', clipboardPasteHint: 'Zugriff auf die Zwischenablage blockiert. Hier klicken und stattdessen Strg/Cmd+V drücken.', clipboardNoImage: 'Kein PNG-, JPEG- oder WebP-Bild in der Zwischenablage gefunden.',
  pdfPagesTitle: 'PDF-Seiten bearbeiten', pdfPagesHelp: 'Seiten sortieren, drehen, entfernen oder einzeln exportieren. Das Original bleibt unverändert.', pdfPagesLoading: 'Seiten werden lokal gelesen …', pdfPagesCount: '{count} Seiten', pdfPageLabel: 'Seite {number}', pdfPageSelect: 'Seite {number} auswählen', pdfPageUp: 'Seite {number} nach oben', pdfPageDown: 'Seite {number} nach unten', pdfPageRotate: 'Seite {number} nach rechts drehen', pdfPageRemove: 'Seite {number} entfernen', pdfPagesSave: 'Bearbeitetes PDF herunterladen', pdfPagesExtract: 'Ausgewählte Seiten herunterladen', pdfPagesReset: 'Seiten zurücksetzen', pdfPagesDone: 'PDF-Download gestartet ✓', pdfPagesEmpty: 'Mindestens eine Seite behalten.', pdfPagesNoneSelected: 'Mindestens eine Seite auswählen.', pdfPagesInvalid: 'Die Seitenauswahl ist ungültig.', pdfPagesUnsafe: 'Dieses PDF enthält interaktive Funktionen oder Signaturen. Die Seitenbearbeitung ist zum Schutz dieser Inhalte gesperrt.', pdfMergeLimit: 'Mindestens 2 PDFs mit zusammen höchstens 512 MB verbinden.', mergePdfs: 'PDFs verbinden', mergedPdfsName: 'pdfs-zusammengefasst.pdf',
  dropFilesHere: 'Dateien hier ablegen',
  adjustedResult: 'Angepasst: {original} → {result}.{target}',
  outputWidth: 'Breite (px)', outputHeight: 'Höhe (px)', dimensionsHelp: 'Ein Wert erhält das Seitenverhältnis; zwei ergänzen bei Bedarf Randfläche.', squareMode: 'Quadratisch', squareNone: 'Nein', squarePad: 'Einpassen ohne Beschnitt', backgroundColor: 'Hintergrundfarbe', backgroundFill: 'Füllen', invalidOutputDimensions: 'Bitte 1–16000 px pro Seite und höchstens 40 Megapixel wählen.', conflictingDimensions: 'Entweder längste Kante oder Breite und Höhe verwenden.', invalidSquareDimensions: 'Für quadratische Ausgabe müssen Breite und Höhe gleich sein.',
  pdfAdjust: 'PDF anpassen', targetSizeSummary: 'Ziel {size} MB', renamedSummary: 'Umbenannt', outputName: 'Dateiname (optional, ohne Endung)', outputNamePlaceholder: 'Vorgeschlagenen Namen behalten', invalidOutputName: 'Bitte einen gültigen Dateinamen ohne Schrägstriche oder Sonderzeichen eingeben.',
  imageAdjust: 'Bild anpassen', maxDimension: 'Längste Kante (px)', autoSize: 'Automatisch', rotate: 'Drehen', noRotation: 'Nicht drehen', squareCrop: 'Mittig quadratisch zuschneiden',
  invalidCrop: 'Ungültige Bildmaße oder ungültiger Zuschnitt.', invalidDimension: 'Bitte eine längste Kante zwischen 1 und 16000 px eingeben.',
  targetReached: 'Ziel erreicht.', targetNotReached: 'Ziel nicht erreicht; bestes lokales Ergebnis angezeigt.',
  pdfComplexKept: 'Dieses PDF kann Formulare oder Signaturen enthalten; Original bleibt.', pdfNoStructuralSaving: 'Keine sichere PDF-Einsparung; Original bleibt.', pdfLargeKept: 'Großes PDF bleibt zum Schutz des Speichers unverändert.', pdfStructureNotice: 'Auswählbarer Text und Vektorseiten bleiben nach Möglichkeit erhalten. Signierte und interaktive PDFs bleiben unverändert.',
  downloadZip: 'Alle als ZIP herunterladen', zipNoResults: 'Bitte zuerst mindestens eine Datei verarbeiten.', zipPartial: '{count} von {total} Ergebnissen enthalten; fehlgeschlagene Dateien wurden ausgelassen.', zipStarted: 'ZIP-Download gestartet ✓',
  useInUpload: 'In Upload-Feld einsetzen', uploadWarning: 'Die Website kann die Datei nach dem Einsetzen sofort hochladen.', uploadUnavailable: 'Nur als installierte Erweiterung auf einer normalen Webseite verfügbar.', uploadTooLarge: 'Für direktes Einsetzen darf das Ergebnis höchstens 2 MB groß sein. Bitte herunterladen.', uploadNoField: 'Auf der ursprünglichen Seite wurde kein passendes Datei-Feld gefunden. Bitte herunterladen und dort auswählen.', uploadDone: 'Datei ins Upload-Feld eingesetzt. Bitte Formular vor dem Absenden prüfen.', uploadFailed: 'Upload-Feld konnte nicht gefüllt werden. Bitte Datei herunterladen und manuell auswählen.',
});
Object.assign(messages.es, {
  removeMetadata: 'Eliminar metadatos', removeMetadataHelp: 'Elimina datos incrustados de autor, ubicación, dispositivo y edición.', removeMetadataPdfWarning: 'Las páginas PDF se reconstruyen como imágenes para eliminar los metadatos de forma fiable. Se pierden búsquedas, enlaces, formularios y firmas.', metadataRemovedResult: ' Metadatos eliminados.', metadataRemovalFailed: 'No se pudieron eliminar de forma fiable los metadatos de este archivo.',
  pdfPagesOne: '1 página', pdfOutputTooLarge: 'El PDF resultante superaría 512 MB.',
  pasteImage: 'Añadir imagen del portapapeles', clipboardPasteHint: 'Acceso al portapapeles bloqueado. Haz clic aquí y pulsa Ctrl/Cmd+V.', clipboardNoImage: 'No hay imagen PNG, JPEG o WebP en el portapapeles.',
  pdfPagesTitle: 'Editar páginas PDF', pdfPagesHelp: 'Ordena, gira, elimina o extrae páginas. El original no cambia.', pdfPagesLoading: 'Leyendo páginas localmente…', pdfPagesCount: '{count} páginas', pdfPageLabel: 'Página {number}', pdfPageSelect: 'Seleccionar página {number}', pdfPageUp: 'Subir página {number}', pdfPageDown: 'Bajar página {number}', pdfPageRotate: 'Girar página {number} a la derecha', pdfPageRemove: 'Eliminar página {number}', pdfPagesSave: 'Descargar PDF editado', pdfPagesExtract: 'Descargar páginas seleccionadas', pdfPagesReset: 'Restablecer páginas', pdfPagesDone: 'Descarga PDF iniciada ✓', pdfPagesEmpty: 'Conserva al menos una página.', pdfPagesNoneSelected: 'Selecciona al menos una página.', pdfPagesInvalid: 'La selección de páginas no es válida.', pdfPagesUnsafe: 'Este PDF tiene funciones interactivas o firmas. La edición se bloquea para protegerlas.', pdfMergeLimit: 'Combina 2 o más PDF con un máximo de 512 MB en total.', mergePdfs: 'Combinar PDF', mergedPdfsName: 'pdfs-combinados.pdf',
  dropFilesHere: 'Suelta los archivos aquí',
  adjustedResult: 'Ajustado: {original} → {result}.{target}',
  outputWidth: 'Ancho (px)', outputHeight: 'Alto (px)', dimensionsHelp: 'Un valor conserva la proporción; dos añaden márgenes si hace falta.', squareMode: 'Cuadrado', squareNone: 'No', squarePad: 'Ajustar sin recortar', backgroundColor: 'Color de fondo', backgroundFill: 'Rellenar', invalidOutputDimensions: 'Usa 1–16000 px por lado y un máximo de 40 megapíxeles.', conflictingDimensions: 'Usa el lado mayor o el ancho y el alto.', invalidSquareDimensions: 'Para un resultado cuadrado, ancho y alto deben coincidir.',
  pdfAdjust: 'Ajustar PDF', targetSizeSummary: 'Objetivo {size} MB', renamedSummary: 'Renombrado', outputName: 'Nombre de archivo (opcional, sin extensión)', outputNamePlaceholder: 'Mantener el nombre sugerido', invalidOutputName: 'Introduce un nombre válido sin barras ni caracteres especiales.',
  imageAdjust: 'Ajustar imagen', maxDimension: 'Lado mayor (px)', autoSize: 'Automático', rotate: 'Girar', noRotation: 'Sin giro', squareCrop: 'Recortar al centro en cuadrado',
  invalidCrop: 'Dimensiones o recorte no válidos.', invalidDimension: 'Introduce un lado mayor entre 1 y 16000 px.',
  targetReached: 'Objetivo alcanzado.', targetNotReached: 'Objetivo no alcanzado; se muestra el mejor resultado local.',
  pdfComplexKept: 'Este PDF puede tener formularios o firmas; se conserva el original.', pdfNoStructuralSaving: 'No hay ahorro seguro en PDF; se conserva el original.', pdfLargeKept: 'PDF grande conservado para proteger la memoria.', pdfStructureNotice: 'Conserva texto seleccionable y vectores cuando es posible. PDF firmados o interactivos no se modifican.',
  downloadZip: 'Descargar todo como ZIP', zipNoResults: 'Procesa al menos un archivo primero.', zipPartial: '{count} de {total} resultados incluidos; se omitieron los fallidos.', zipStarted: 'Descarga ZIP iniciada ✓',
  useInUpload: 'Usar en campo de carga', uploadWarning: 'El sitio puede subir el archivo inmediatamente después de insertarlo.', uploadUnavailable: 'Solo disponible como extensión instalada en una página web normal.', uploadTooLarge: 'Para la carga directa, el resultado debe ser de 2 MB o menos. Descárgalo.', uploadNoField: 'No se encontró un campo de archivo compatible en la página original. Descarga y selecciona allí el archivo.', uploadDone: 'Archivo insertado en el campo de carga. Revisa el formulario antes de enviarlo.', uploadFailed: 'No se pudo rellenar el campo de carga. Descarga y selecciona el archivo manualmente.',
});
Object.assign(messages.fr, {
  removeMetadata: 'Supprimer les métadonnées', removeMetadataHelp: 'Supprime les données intégrées sur l’auteur, le lieu, l’appareil et les modifications.', removeMetadataPdfWarning: 'Les pages PDF sont reconstruites en images pour supprimer les métadonnées de façon fiable. Recherche, liens, formulaires et signatures sont perdus.', metadataRemovedResult: ' Métadonnées supprimées.', metadataRemovalFailed: 'Les métadonnées de ce fichier n’ont pas pu être supprimées de façon fiable.',
  pdfPagesOne: '1 page', pdfOutputTooLarge: 'Le PDF résultant dépasserait 512 Mo.',
  pasteImage: 'Ajouter une image du presse-papiers', clipboardPasteHint: 'Accès au presse-papiers bloqué. Cliquez ici puis utilisez Ctrl/Cmd+V.', clipboardNoImage: 'Aucune image PNG, JPEG ou WebP dans le presse-papiers.',
  pdfPagesTitle: 'Modifier les pages PDF', pdfPagesHelp: 'Réorganisez, tournez, supprimez ou extrayez des pages. L’original reste inchangé.', pdfPagesLoading: 'Lecture locale des pages…', pdfPagesCount: '{count} pages', pdfPageLabel: 'Page {number}', pdfPageSelect: 'Sélectionner la page {number}', pdfPageUp: 'Monter la page {number}', pdfPageDown: 'Descendre la page {number}', pdfPageRotate: 'Tourner la page {number} à droite', pdfPageRemove: 'Supprimer la page {number}', pdfPagesSave: 'Télécharger le PDF modifié', pdfPagesExtract: 'Télécharger les pages sélectionnées', pdfPagesReset: 'Réinitialiser les pages', pdfPagesDone: 'Téléchargement PDF lancé ✓', pdfPagesEmpty: 'Conservez au moins une page.', pdfPagesNoneSelected: 'Sélectionnez au moins une page.', pdfPagesInvalid: 'La sélection de pages est invalide.', pdfPagesUnsafe: 'Ce PDF contient des fonctions interactives ou des signatures. La modification est bloquée pour les protéger.', pdfMergeLimit: 'Combinez au moins 2 PDF de 512 Mo maximum au total.', mergePdfs: 'Combiner les PDF', mergedPdfsName: 'pdfs-combines.pdf',
  dropFilesHere: 'Déposez les fichiers ici',
  adjustedResult: 'Ajusté : {original} → {result}.{target}',
  outputWidth: 'Largeur (px)', outputHeight: 'Hauteur (px)', dimensionsHelp: 'Une valeur conserve les proportions ; deux ajoutent des marges si besoin.', squareMode: 'Carré', squareNone: 'Non', squarePad: 'Ajuster sans rogner', backgroundColor: 'Couleur de fond', backgroundFill: 'Remplir', invalidOutputDimensions: 'Utilisez 1–16000 px par côté et 40 mégapixels au maximum.', conflictingDimensions: 'Utilisez le côté long ou la largeur et la hauteur.', invalidSquareDimensions: 'Pour un résultat carré, largeur et hauteur doivent être égales.',
  pdfAdjust: 'Ajuster le PDF', targetSizeSummary: 'Cible {size} Mo', renamedSummary: 'Renommé', outputName: 'Nom du fichier (facultatif, sans extension)', outputNamePlaceholder: 'Garder le nom suggéré', invalidOutputName: 'Saisissez un nom valide sans barre oblique ni caractère spécial.',
  imageAdjust: 'Ajuster l’image', maxDimension: 'Côté le plus long (px)', autoSize: 'Automatique', rotate: 'Rotation', noRotation: 'Aucune rotation', squareCrop: 'Recadrer au centre en carré',
  invalidCrop: 'Dimensions ou recadrage invalides.', invalidDimension: 'Saisissez un côté entre 1 et 16000 px.',
  targetReached: 'Objectif atteint.', targetNotReached: 'Objectif non atteint ; meilleur résultat local affiché.',
  pdfComplexKept: 'Ce PDF peut contenir des formulaires ou signatures ; original conservé.', pdfNoStructuralSaving: 'Aucun gain PDF sûr ; original conservé.', pdfLargeKept: 'PDF volumineux conservé pour protéger la mémoire.', pdfStructureNotice: 'Préserve le texte sélectionnable et les vecteurs si possible. Les PDF signés ou interactifs restent inchangés.',
  downloadZip: 'Tout télécharger en ZIP', zipNoResults: 'Traitez au moins un fichier avant.', zipPartial: '{count} résultats sur {total} inclus ; échecs ignorés.', zipStarted: 'Téléchargement ZIP lancé ✓',
  useInUpload: 'Utiliser dans le champ de dépôt', uploadWarning: 'Le site peut envoyer le fichier immédiatement après son insertion.', uploadUnavailable: 'Disponible uniquement comme extension installée sur une page web normale.', uploadTooLarge: 'Pour le dépôt direct, le résultat doit faire 2 Mo ou moins. Téléchargez-le.', uploadNoField: 'Aucun champ de fichier compatible trouvé sur la page initiale. Téléchargez puis sélectionnez le fichier.', uploadDone: 'Fichier inséré dans le champ de dépôt. Vérifiez le formulaire avant envoi.', uploadFailed: 'Impossible de remplir le champ de dépôt. Téléchargez et sélectionnez le fichier manuellement.',
});

export function localeFromLanguages(languages) {
  for (const language of languages) {
    const code = String(language || '').toLowerCase().split(/[-_]/)[0];
    if (Object.hasOwn(messages, code)) return code;
  }
  return 'en';
}

const browserLanguage = (() => {
  try { return (globalThis.browser ?? globalThis.chrome)?.i18n?.getUILanguage?.(); }
  catch { return undefined; }
})();

const detectedLocale = localeFromLanguages([browserLanguage, ...(globalThis.navigator?.languages ?? []), globalThis.navigator?.language]);
const preferenceKey = 'locoVerte.language';

export function getLanguagePreference() {
  try {
    const value = globalThis.localStorage?.getItem(preferenceKey);
    return Object.hasOwn(messages, value) ? value : 'auto';
  } catch { return 'auto'; }
}

export let locale = getLanguagePreference() === 'auto' ? detectedLocale : getLanguagePreference();

export function setLanguagePreference(value) {
  if (value !== 'auto' && !Object.hasOwn(messages, value)) return false;
  try {
    const storage = globalThis.localStorage;
    if (!storage) return false;
    if (value === 'auto') storage.removeItem(preferenceKey);
    else storage.setItem(preferenceKey, value);
    locale = value === 'auto' ? detectedLocale : value;
    return true;
  } catch { return false; }
}

export function t(key, values = {}) {
  const template = messages[locale][key] ?? messages.en[key];
  if (template === undefined) throw new Error(`Missing translation: ${key}`);
  return template.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? ''));
}

export function applyStaticTranslations(root = document) {
  root.documentElement.lang = locale;
  root.title = t('appName');
  for (const element of root.querySelectorAll('[data-i18n]')) element.textContent = t(element.dataset.i18n);
  for (const attribute of ['aria-label', 'title', 'placeholder', 'alt']) {
    const dataName = `i18n${attribute.split('-').map((part) => part[0].toUpperCase() + part.slice(1)).join('')}`;
    for (const element of root.querySelectorAll(`[data-i18n-${attribute}]`)) element.setAttribute(attribute, t(element.dataset[dataName]));
  }
}
