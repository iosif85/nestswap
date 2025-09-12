import MessageThread from '../MessageThread';
import caravanImage from '@assets/generated_images/Modern_caravan_interior_design_28716383.png';

export default function MessageThreadExample() {
  // Mock data
  const mockMessages = [
    {
      id: '1',
      senderId: 'other-user',
      senderName: 'Sarah Johnson',
      content: 'Hi! I\'m interested in swapping with your mountain caravan. My cabin is available for the same dates.',
      timestamp: '2024-01-15T10:30:00Z',
      isRead: true,
    },
    {
      id: '2',
      senderId: 'current-user',
      senderName: 'You',
      content: 'That sounds great! I\'d love to see more photos of your cabin. What amenities does it have?',
      timestamp: '2024-01-15T10:35:00Z',
      isRead: true,
    },
    {
      id: '3',
      senderId: 'other-user',
      senderName: 'Sarah Johnson',
      content: 'It has a full kitchen, fireplace, hot tub, and amazing mountain views. I can send you more photos via email if you\'d like.',
      timestamp: '2024-01-15T10:40:00Z',
      isRead: true,
    },
    {
      id: '4',
      senderId: 'current-user',
      senderName: 'You',
      content: 'Perfect! Yes, please send them to john@example.com. When would you like to do the swap?',
      timestamp: '2024-01-15T10:45:00Z',
      isRead: false,
    },
  ];

  const otherUser = {
    id: 'other-user',
    name: 'Sarah Johnson',
    avatar: undefined,
    isOnline: true,
  };

  return (
    <div className="h-96 border rounded-lg overflow-hidden">
      <MessageThread
        threadId="thread-1"
        propertyTitle="Luxury Mountain Caravan"
        propertyImage={caravanImage}
        propertyLocation="Lake District, UK"
        propertyRating={4.8}
        otherUser={otherUser}
        messages={mockMessages}
        currentUserId="current-user"
      />
    </div>
  );
}