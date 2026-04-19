export default function deleteTemporaryFiles(...filePaths) {
    filePaths.forEach(filePath => {
        if (filePath) {
            try {
                fs.unlinkSync(filePath);
                console.log(`Temporary file at ${filePath} deleted successfully.`);
            } catch (err) {
                console.error(`Error deleting temporary file at ${filePath}:`, err);
                return false;
            }
        }   
    });
    return true;
}