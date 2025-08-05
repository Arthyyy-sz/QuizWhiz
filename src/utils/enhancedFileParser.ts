@@ .. @@
   private static async parsePDF(file: File): Promise<string> {
     return new Promise((resolve, reject) => {
       const reader = new FileReader();
       
       reader.onload = async (e) => {
         try {
           const arrayBuffer = e.target?.result as ArrayBuffer;
           const uint8Array = new Uint8Array(arrayBuffer);
           
-          // Enhanced PDF text extraction
+          // Enhanced PDF text extraction with better support for multi-page documents
           const decoder = new TextDecoder('utf-8');
           let text = decoder.decode(uint8Array);
           
-          // Remove PDF binary data and extract readable text
+          // Enhanced text extraction for complex PDFs
           text = text.replace(/[^\x20-\x7E\u00A0-\uFFFF\n\r\t]/g, ' ');
           
-          // Extract text between common PDF text markers
-          const textMatches = text.match(/\(([^)]+)\)/g) || [];
+          // Multiple extraction strategies for better coverage
+          const textMatches = text.match(/\(([^)]+)\)/g) || [];
           const extractedText = textMatches
             .map(match => match.slice(1, -1))
-            .filter(t => t.length > 2 && !/^[0-9\s]*$/.test(t))
+            .filter(t => t.length > 1 && !/^[0-9\s\-_\.]*$/.test(t))
             .join(' ');
           
-          // Also try to extract text from stream objects
+          // Extract from stream objects (more comprehensive)
           const streamMatches = text.match(/stream\s*(.*?)\s*endstream/gs) || [];
           const streamText = streamMatches
             .map(match => match.replace(/stream|endstream/g, ''))
             .join(' ')
             .replace(/[^\x20-\x7E\u00A0-\uFFFF\n\r\t]/g, ' ')
             .replace(/\s+/g, ' ');
 
+          // Try to extract from Tj and TJ operators (PDF text showing operators)
+          const tjMatches = text.match(/\[(.*?)\]\s*TJ/g) || [];
+          const tjText = tjMatches
+            .map(match => match.replace(/\[|\]\s*TJ/g, ''))
+            .join(' ')
+            .replace(/[()]/g, '')
+            .replace(/\s+/g, ' ');
+
+          // Extract from simple text operators
+          const simpleTextMatches = text.match(/\((.*?)\)\s*Tj/g) || [];
+          const simpleText = simpleTextMatches
+            .map(match => match.replace(/\(|\)\s*Tj/g, ''))
+            .join(' ');
+
           let finalText = extractedText || streamText;
+          
+          // If still not enough text, try alternative methods
+          if (finalText.length < 100) {
+            finalText = tjText || simpleText || finalText;
+          }
           
           // Clean up the text
           finalText = finalText
             .replace(/\s+/g, ' ')
-            .replace(/[^\w\s\u00A0-\uFFFF.,!?;:()\-"']/g, ' ')
+            .replace(/[^\w\s\u00A0-\uFFFF.,!?;:()\-"'\n\r]/g, ' ')
+            .replace(/\n\s*\n/g, '\n')
             .trim();
           
-          if (finalText.length < 50) {
-            reject(new Error('Could not extract sufficient text from PDF. The file might be image-based or encrypted.'));
+          if (finalText.length < 30) {
+            reject(new Error('Could not extract sufficient text from PDF. The file might be image-based, encrypted, or contain complex formatting. Try converting to plain text first.'));
           } else {
             resolve(finalText);
           }
         } catch (error) {
-          reject(new Error('Failed to parse PDF file. Please try converting it to text first.'));
+          reject(new Error('Failed to parse PDF file. For better results, try converting to plain text or using a simpler PDF format.'));
         }
       };
       
       reader.onerror = () => reject(new Error('Failed to read PDF file'));
       reader.readAsArrayBuffer(file);
     });
   }
@@ .. @@
   private static async parsePowerPoint(file: File): Promise<string> {
     return new Promise((resolve, reject) => {
       const reader = new FileReader();
       
       reader.onload = async (e) => {
         try {
           const arrayBuffer = e.target?.result as ArrayBuffer;
           
-          // PowerPoint files are ZIP archives, we'll extract text from XML files
+          // Enhanced PowerPoint parsing for better multi-slide support
           const uint8Array = new Uint8Array(arrayBuffer);
           const decoder = new TextDecoder('utf-8');
           let content = decoder.decode(uint8Array);
           
-          // Look for slide content in XML format
+          // Multiple extraction strategies for PowerPoint content
           const textMatches = content.match(/<a:t[^>]*>([^<]+)<\/a:t>/g) || [];
           const extractedText = textMatches
             .map(match => match.replace(/<[^>]+>/g, ''))
             .filter(text => text.trim().length > 0)
             .join(' ');
           
-          // Also try to extract from paragraph elements
+          // Extract from paragraph elements
           const paragraphMatches = content.match(/<a:p[^>]*>.*?<\/a:p>/gs) || [];
           const paragraphText = paragraphMatches
             .map(match => match.replace(/<[^>]+>/g, ' '))
             .join(' ')
             .replace(/\s+/g, ' ')
             .trim();
           
-          const finalText = (extractedText || paragraphText).trim();
+          // Try to extract from slide text elements
+          const slideTextMatches = content.match(/<p:txBody[^>]*>.*?<\/p:txBody>/gs) || [];
+          const slideText = slideTextMatches
+            .map(match => match.replace(/<[^>]+>/g, ' '))
+            .join(' ')
+            .replace(/\s+/g, ' ')
+            .trim();
+
+          // Try to extract from run elements
+          const runMatches = content.match(/<a:r[^>]*>.*?<\/a:r>/gs) || [];
+          const runText = runMatches
+            .map(match => match.replace(/<[^>]+>/g, ' '))
+            .join(' ')
+            .replace(/\s+/g, ' ')
+            .trim();
+
+          let finalText = extractedText || paragraphText || slideText || runText;
+          finalText = finalText.trim();
           
-          if (finalText.length < 20) {
-            reject(new Error('Could not extract sufficient text from PowerPoint file.'));
+          if (finalText.length < 15) {
+            reject(new Error('Could not extract sufficient text from PowerPoint file. The presentation might contain mostly images or complex formatting.'));
           } else {
             resolve(finalText);
           }
         } catch (error) {
-          reject(new Error('Failed to parse PowerPoint file. Please save as PDF or copy the text manually.'));
+          reject(new Error('Failed to parse PowerPoint file. For better results, try saving as PDF or copying the text manually.'));
         }
       };
       
       reader.onerror = () => reject(new Error('Failed to read PowerPoint file'));
       reader.readAsArrayBuffer(file);
     });
   }
@@ .. @@
   private static async parseWord(file: File): Promise<string> {
     return new Promise((resolve, reject) => {
       const reader = new FileReader();
       
       reader.onload = async (e) => {
         try {
           const arrayBuffer = e.target?.result as ArrayBuffer;
           
-          // Word files are ZIP archives, extract text from document.xml
+          // Enhanced Word document parsing for better content extraction
           const uint8Array = new Uint8Array(arrayBuffer);
           const decoder = new TextDecoder('utf-8');
           let content = decoder.decode(uint8Array);
           
-          // Look for text content in Word XML format
+          // Multiple extraction strategies for Word documents
           const textMatches = content.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || [];
           const extractedText = textMatches
             .map(match => match.replace(/<[^>]+>/g, ''))
             .filter(text => text.trim().length > 0)
             .join(' ');
           
-          // Also try to extract from paragraph runs
+          // Extract from paragraph runs
           const runMatches = content.match(/<w:r[^>]*>.*?<\/w:r>/gs) || [];
           const runText = runMatches
             .map(match => match.replace(/<[^>]+>/g, ' '))
             .join(' ')
             .replace(/\s+/g, ' ')
             .trim();
           
-          const finalText = (extractedText || runText).trim();
+          // Extract from paragraph elements
+          const paragraphMatches = content.match(/<w:p[^>]*>.*?<\/w:p>/gs) || [];
+          const paragraphText = paragraphMatches
+            .map(match => match.replace(/<[^>]+>/g, ' '))
+            .join(' ')
+            .replace(/\s+/g, ' ')
+            .trim();
+
+          // Extract from table cells
+          const tableCellMatches = content.match(/<w:tc[^>]*>.*?<\/w:tc>/gs) || [];
+          const tableText = tableCellMatches
+            .map(match => match.replace(/<[^>]+>/g, ' '))
+            .join(' ')
+            .replace(/\s+/g, ' ')
+            .trim();
+
+          let finalText = extractedText || runText || paragraphText || tableText;
+          finalText = finalText.trim();
           
-          if (finalText.length < 20) {
-            reject(new Error('Could not extract sufficient text from Word document.'));
+          if (finalText.length < 15) {
+            reject(new Error('Could not extract sufficient text from Word document. The document might contain mostly images, tables, or complex formatting.'));
           } else {
             resolve(finalText);
           }
         } catch (error) {
-          reject(new Error('Failed to parse Word document. Please save as PDF or copy the text manually.'));
+          reject(new Error('Failed to parse Word document. For better results, try saving as PDF or copying the text manually.'));
         }
       };
       
       reader.onerror = () => reject(new Error('Failed to read Word document'));
       reader.readAsArrayBuffer(file);
     });
   }