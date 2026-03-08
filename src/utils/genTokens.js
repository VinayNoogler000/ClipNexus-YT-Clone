export const genRefreshAndAccessTokens = async (userInDB) => {
    const accessToken = userInDB.generateAccessToken();
    const refreshToken = userInDB.generateRefreshToken();

    userInDB.refreshToken = refreshToken;

    try {
        await userInDB.save({ validateBeforeSave: false });
    }
    catch(err) {
        throw new ApiError(501, "Error in Saving Refresh-Token to DB");
    }

    return { accessToken, refreshToken };
}