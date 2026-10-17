import AdminWorkspace from "./AdminWorkspace";
export default function ListBookings() {
  return <AdminWorkspace view="bookings" initialAdd={false} />;
}
