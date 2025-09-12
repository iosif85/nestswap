import Navigation from '../Navigation';

export default function NavigationExample() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Unauthenticated Navigation</h3>
        <Navigation />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Authenticated User (No Subscription)</h3>
        <Navigation isAuthenticated={true} />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Subscribed User</h3>
        <Navigation isAuthenticated={true} isSubscribed={true} />
      </div>
    </div>
  );
}