const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const apiRoute = require('./routes/index.v1');

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// 在 Vercel serverless function 中，路由 /api/v1/(.*) 已經處理了前綴
// 傳入的路徑不包含 /api/v1，直接使用 apiRoute
// 本地開發時，如果路徑包含 /api/v1，則移除前綴
app.use((req, res, next) => {
	if (req.path.startsWith('/api/v1')) {
		req.url = req.url.replace('/api/v1', '') || '/';
	}
	next();
});

app.use(apiRoute);
app.use(express.static(path.join(__dirname, 'public')));

// Catch 404 and forward to error handler
app.use((req, res, next) => {
	next(createError(404));
});

// Error handler
app.use((err, req, res, _next) => {
	// Set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// Render the error page
	res.status(err.status || 500);
	res.json({
		error: {
			message: err.message,
			status: err.status || 500,
		},
	});
});

const port = process.env.PORT || 9000;

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});

module.exports = app;
