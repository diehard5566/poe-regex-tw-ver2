// App.js
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, NavLink } from 'react-router-dom';
import './App.css';
import Maps from './components/MapsController.js/Maps';
import Items from './components/ItemController/Items';
import Scarabs from './components/ScarabController/Scarabs';
import AdBanner from './components/AdBanner';
import Support from './components/Support';
import Waystones from './components/Poe2/Waystones';
import './style/global.css';

const AffixTool = lazy(() => import('./components/Poe2/AffixTool'));
const Poe2Items = lazy(() => import('./components/Poe2/Items'));
const Vendor = lazy(() => import('./components/Poe2/Vendor'));

const App = () => (
	<Router>
		<div className="container">
			<div className="sidebar">
				<h2>POE regex TW</h2>
				<h3 className="nav-group">POE 1</h3>
				<ul>
					<li><Link to="/maps">地圖詞綴</Link></li>
					<li><Link to="/scarabs">聖甲蟲</Link></li>
					{/* <li><Link to="/items">物品詞綴</Link></li> */}
					<li><a href="https://www.poepricer.com/" target="_blank" rel="noopener noreferrer">通貨物價</a></li>
				</ul>
				<h3 className="nav-group">POE 2</h3>
				<ul>
					<li><NavLink to="/poe2/waystones">換界石詞綴</NavLink></li>
					<li><NavLink to="/poe2/tablets">碑牌</NavLink></li>
					<li><NavLink to="/poe2/relics">聖物</NavLink></li>
					<li><NavLink to="/poe2/vendor">商店搜尋</NavLink></li>
					<li><NavLink to="/poe2/items">物品詞綴</NavLink></li>
				</ul>
				<ul style={{ marginTop: '20px' }}>
					<li><Link to="/support">贊助支持</Link></li>
				</ul>
				<AdBanner containerId="ad-container-160x300" adKey="8aa48f28f44655793a58aa6ec898cc28" width={160} height={300} />
				<AdBanner containerId="ad-container-300x250" adKey="e0006c1ec20d7b2bf6f267f58d569650" width={300} height={250} />
			</div>
			<div className="main">
				<Suspense fallback={<p role="status">載入工具中…</p>}>
				<Routes>
					<Route path="/poe2/waystones" element={<Waystones/>}/>
					<Route path="/poe2/tablets" element={<AffixTool key="tablets"/>}/>
					<Route path="/poe2/relics" element={<AffixTool key="relics"/>}/>
					<Route path="/poe2/vendor" element={<Vendor/>}/>
					<Route path="/poe2/items" element={<Poe2Items/>}/>
					<Route path="/maps" element={<Maps/>}/>
					<Route path="/scarabs" element={<Scarabs/>}/>
					<Route path="/items" element={<Items/>}/>
					<Route path="/support" element={<Support/>}/>
					<Route exact path="/" element={<Home/>}/>
				</Routes>
				</Suspense>
			</div>
		</div>
	</Router>
);

const Home = () => (
	<div>
		<h2>歡迎使用 POE regex TW</h2>
		<p>請選擇左側功能開始使用。</p>
	</div>
);

export default App;
