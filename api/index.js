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

// 處理路徑：移除 /api/v1 前綴（如果存在）
// 在 Vercel 中，路由 /api/v1/(.*) 匹配後，路徑可能還包含前綴或已經移除
// 為了兼容兩種情況，統一處理
app.use((req, res, next) => {
	const originalPath = req.path;
	const originalUrl = req.url;

	// Debug logging
	console.log('Request - Original path:', originalPath, 'URL:', originalUrl);

	// 如果路徑以 /api/v1 開頭，移除前綴
	if (originalPath.startsWith('/api/v1')) {
		req.path = originalPath.replace(/^\/api\/v1/, '') || '/';
		req.url = originalUrl.replace(/^\/api\/v1/, '') || '/';
		console.log('Removed /api/v1 - New path:', req.path, 'URL:', req.url);
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
