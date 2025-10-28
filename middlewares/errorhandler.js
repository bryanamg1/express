const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const msg = err.message || 'Internal Server Error';

    console.error(`[${new Date().toISOString()}] status: ${statusCode} - message: ${msg}`); 

    if(err.sack){
        console.error(err.stak);
        
    }
    res.status(statusCode).json({ status:"error", msg ,statusCode,...(process.env.NODE_ENV === 'development' && {stack: err.stack}) });

};

export default errorHandler;