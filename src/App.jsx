import React from 'react';
import { Routes, Route, Navigate, ScrollRestoration } from 'react-router-dom';

// 导入页面组件
import Home from './pages/Home';
import OldScenicDetail from './pages/ScenicDetail';
import RouteRecord from './pages/RouteRecord/index.jsx';
import ScenicMap from './pages/Map/index';
import Profile from './pages/Profile';
import OldFeedback from './pages/Feedback';
import Facilities from './pages/Facilities';
import EnhancedMap from './pages/EnhancedMap';
import CommunicationAid from './pages/CommunicationAid';
import OldHealthManager from './pages/HealthManager';
import Reviews from './pages/Reviews';
import ScenicList from './pages/ScenicList';
import AccessibilityMap from './pages/AccessibilityMap';
import ShanghaiZooMap from './pages/ShanghaiZooMap';
import SimpleZooMap from './pages/SimpleZooMap';
import TestZooData from './pages/TestZooData';
import ZooMapPage from './pages/ZooMapPage';
import ScenicMapPage from './pages/ScenicMapPage';
import HomePage from './newPages/HomePage/index.jsx';
import TabBarLayout from './components/TabLayout/index.jsx';
import QuickBar from './components/QuickBar/index.jsx';
import ScenicAreaList from './newPages/ScenicAreaList/index.jsx';
import MyProfile from './newPages/MyProfile/index.jsx';
// 新增独立页面导入
import MyFavoritesPage from './newPages/MyFavorites/index.jsx';
import MyReviewsPage from './newPages/MyReviews/index.jsx';
import MyFeedbackPage from './newPages/MyFeedback/index.jsx';
import CommunityPage from './newPages/CommunityPage/index.jsx';
import FacilitiesQuery from './newPages/FacilitiesQuery/index.jsx';
import ScenicDetail from './newPages/ScenicDetail/index.jsx';
import HealthManager from './newPages/HealthManager/index.jsx';
import WishListPage from './newPages/WishListPage/index.jsx';
import CommunicationAidPage from './newPages/CommunicationAid/index.jsx';
import Settings from './newPages/Settings/index.jsx';
import MapPage from './pages/MapPage/index.jsx';
import FeedbackPage from './newPages/Feedback/index.jsx';

function App() {
  return (
    <div className="App">
      {/* 重置滚动 */}
      <ScrollRestoration />
      {/* 快捷工具全局展示 */}
      <QuickBar />
      <Routes>
        {/* 包含TabBar的主要页面 */}
        <Route path="/" element={<TabBarLayout />}>
          <Route index element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/list" element={<ScenicAreaList />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/community" element={<CommunityPage />} />
        </Route>

        {/* 独立页面 */}
        <Route path="/wish-list" element={<WishListPage />} />
        <Route path="/communication-aid" element={<CommunicationAidPage />} />
        <Route path="/favorites" element={<MyFavoritesPage />} />
        <Route path="/reviews" element={<MyReviewsPage />} />
        <Route path="/feedback" element={<MyFeedbackPage />} />
        <Route path="/facilities" element={<FacilitiesQuery />} />
        <Route path="/scenic/:id" element={<ScenicDetail />} />
        <Route path="/health-manager" element={<HealthManager />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/feedback/add" element={<FeedbackPage />} />

        <Route path="/old-home" element={<Home />} />
        <Route path="/old-scenic/:id" element={<OldScenicDetail />} />
        <Route path="/accessibility-map/:id" element={<AccessibilityMap />} />
        <Route path="/scenic/:id/record" element={<RouteRecord />} />
        <Route path="/scenic/map" element={<ScenicMap />} />
        <Route path="/old-feedback/add" element={<OldFeedback />} />
        <Route path="/old-profile" element={<Profile />} />
        <Route path="/old-facilities" element={<Facilities />} />
        <Route path="/facilities/:scenicId" element={<Facilities />} />
        <Route path="/enhanced-map" element={<EnhancedMap />} />
        <Route path="/enhanced-map/:scenicId" element={<EnhancedMap />} />
        <Route path="/old-communication-aid" element={<CommunicationAid />} />
        <Route path="/old-health-manager" element={<OldHealthManager />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/scenic-list" element={<ScenicList />} />
        <Route path="/shanghai-zoo-map" element={<ShanghaiZooMap />} />
        <Route path="/simple-zoo-map" element={<SimpleZooMap />} />
        <Route path="/test-zoo-data" element={<TestZooData />} />
        <Route path="/zoo-map/:id" element={<ZooMapPage />} />
        <Route path="/scenic-map/:id" element={<ScenicMapPage />} />
        <Route path="/map/:id" element={<MapPage />} />
      </Routes>
    </div>
  );
}

export default App;
