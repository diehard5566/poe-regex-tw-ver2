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

// 處理路徑：在 Vercel 中，路由 /api/v1/(.*) 匹配後，傳入的路徑是匹配的部分（例如：/maps）
// 本地開發時，路徑是完整的 /api/v1/maps，需要移除前綴
app.use((req, res, next) => {
	const originalPath = req.path;
	const originalUrl = req.url;

	// Debug logging
	console.log('[API] Request received - Path:', originalPath, 'URL:', originalUrl, 'Method:', req.method);

	// 如果路徑以 /api/v1 開頭，移除前綴（本地開發情況）
	if (originalPath.startsWith('/api/v1')) {
		const newPath = originalPath.replace(/^\/api\/v1/, '') || '/';
		const newUrl = originalUrl.replace(/^\/api\/v1/, '') || '/';
		req.path = newPath;
		req.url = newUrl;
		console.log('[API] Removed /api/v1 prefix - New path:', req.path, 'URL:', req.url);
	}

	next();
});

// 使用 apiRoute（包含 /maps 和 /items 路由）
app.use(apiRoute);

// Debug: 記錄所有註冊的路由
console.log('[API] Routes registered:', app._router?.stack?.map(layer => layer.route?.path || layer.regexp).filter(Boolean));
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
