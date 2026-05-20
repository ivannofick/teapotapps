export const responseApi = async (
    res,
    data,
    meta,
    message = "Data retrieved successfully",
    status = 0
) => {
    if (status == 418) {
        message = customMessageFourHundredAndEighteen(message)
        status = 400
    }
    return res.status(200).json({
        data,
        meta,
        status: {
            code: status,
            message_client: message,
        },
    });
};

const customMessageFourHundredAndEighteen = (message) => {
    return "[I am a teapot]: "+message
}