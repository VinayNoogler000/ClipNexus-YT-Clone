const asyncHandler = (asyncFunc) => {
    return (req, res, next) => {
        Promise.resolve(asyncFunc(req, res, next)).catch(err => next(err));
    }
}

// Another Way which is easier to Read and Understand:
/*
const asyncHandler = (fn) => {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        }
        catch(err) {
            res.status(err.code || 500).json({
                success: false,
                message: err.message
            });
        }
    }
}
*/

export default asyncHandler;