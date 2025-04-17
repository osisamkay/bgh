import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import BookingFlow from '../components/booking/BookingFlow';

const BookingPage = () => {
  const router = useRouter();
  const { roomId } = router.query;

  // In a real application, you would fetch the room details from your API
  const roomDetails = {
    id: roomId,
    name: 'Deluxe Room',
    price: 200,
    maxOccupancy: 2,
    // Add other room details as needed
  };

  return (
    <Layout>
      <BookingFlow roomDetails={roomDetails} />
    </Layout>
  );
};

export default BookingPage; 