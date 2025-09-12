import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, MoreVertical, Star, MapPin } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

interface MessageThreadProps {
  threadId: string;
  propertyTitle?: string;
  propertyImage?: string;
  propertyLocation?: string;
  propertyRating?: number;
  otherUser: {
    id: string;
    name: string;
    avatar?: string;
    isOnline?: boolean;
  };
  messages: Message[];
  currentUserId: string;
  onSendMessage?: (content: string) => void;
  onViewProperty?: () => void;
}

export default function MessageThread({
  threadId,
  propertyTitle,
  propertyImage,
  propertyLocation,
  propertyRating,
  otherUser,
  messages,
  currentUserId,
  onSendMessage = () => console.log('Message sent'),
  onViewProperty = () => console.log('View property clicked'),
}: MessageThreadProps) {
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
              <AvatarFallback>{otherUser.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            {otherUser.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold">{otherUser.name}</h3>
            <p className="text-sm text-muted-foreground">
              {otherUser.isOnline ? 'Online' : 'Last seen recently'}
            </p>
          </div>
        </div>
        
        <Button variant="ghost" size="icon" data-testid="button-thread-options">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {/* Property Context (if applicable) */}
      {propertyTitle && (
        <div className="p-4 border-b border-border bg-muted/20">
          <div className="flex items-center space-x-3">
            {propertyImage && (
              <img
                src={propertyImage}
                alt={propertyTitle}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{propertyTitle}</h4>
              {propertyLocation && (
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3 mr-1" />
                  <span>{propertyLocation}</span>
                </div>
              )}
              {propertyRating && (
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                  <span>{propertyRating} rating</span>
                </div>
              )}
            </div>
            <Button size="sm" variant="outline" onClick={onViewProperty} data-testid="button-view-property">
              View
            </Button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isCurrentUser = message.senderId === currentUserId;
          
          return (
            <div
              key={message.id}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-[80%] ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {!isCurrentUser && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={message.senderAvatar} alt={message.senderName} />
                    <AvatarFallback className="text-xs">
                      {message.senderName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`space-y-1 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`px-3 py-2 rounded-lg text-sm ${
                      isCurrentUser
                        ? 'bg-primary text-primary-foreground rounded-br-sm'
                        : 'bg-muted text-muted-foreground rounded-bl-sm'
                    }`}
                  >
                    {message.content}
                  </div>
                  <div className={`flex items-center space-x-1 text-xs text-muted-foreground ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                    <span>{formatTime(message.timestamp)}</span>
                    {isCurrentUser && (
                      <Badge variant="outline" className="text-xs h-4 px-1">
                        {message.isRead ? 'Read' : 'Sent'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
            data-testid="input-message"
          />
          <Button 
            type="submit" 
            size="icon"
            disabled={!newMessage.trim()}
            data-testid="button-send-message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}