import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Menu from './pages/Menu';
import Order from './pages/Order';
import Track from './pages/Track';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import AdminHome from './pages/admin/AdminHome';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminDeliveryStaff from './pages/admin/AdminDeliveryStaff';
import AdminFeedbacks from './pages/admin/AdminFeedbacks';
import AdminProfile from './pages/admin/AdminProfile';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Customer Routes with Navbar and Footer */}
          <Route path="/" element={
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <Home />
              </main>
              <Footer />
            </div>
          } />
          <Route path="/menu" element={
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <ProtectedRoute>
                  <Menu />
                </ProtectedRoute>
              </main>
              <Footer />
            </div>
          } />
          <Route path="/order" element={
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <ProtectedRoute>
                  <Order />
                </ProtectedRoute>
              </main>
              <Footer />
            </div>
          } />
          <Route path="/track" element={
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <ProtectedRoute>
                  <Track />
                </ProtectedRoute>
              </main>
              <Footer />
            </div>
          } />
          <Route path="/profile" element={
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              </main>
              <Footer />
            </div>
          } />

          {/* Admin Routes - AdminLayout handles navbar */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminHome />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute>
              <AdminOrders />
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute>
              <AdminProducts />
            </ProtectedRoute>
          } />
          <Route path="/admin/customers" element={
            <ProtectedRoute>
              <AdminCustomers />
            </ProtectedRoute>
          } />
          <Route path="/admin/delivery-staff" element={
            <ProtectedRoute>
              <AdminDeliveryStaff />
            </ProtectedRoute>
          } />
          <Route path="/admin/feedbacks" element={
            <ProtectedRoute>
              <AdminFeedbacks />
            </ProtectedRoute>
          } />
          <Route path="/admin/profile" element={
            <ProtectedRoute>
              <AdminProfile />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
