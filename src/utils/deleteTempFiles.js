export default function deleteTemporaryFiles(...filePaths) {
    filePaths.forEach(filePath => {
        if (filePath) {
            try {
                fs.unlinkSync(filePath);
                console.log(`Temporary file at ${filePath} deleted successfully.`);
                return true;
            } catch (err) {
                console.error(`Error deleting temporary file at ${filePath}:`, err);
                return false;
            }
        }
        else {
            console.warn("No file path provided for deletion.");
            return false;
        }
    });
}