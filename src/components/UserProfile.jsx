import React from 'react';

function UserProfile({ user }) {
  return (
    <div className="p-4 bg-gray-100 border-r border-gray-300">
      <h2 className="text-lg font-semibold">{user.name}</h2>
    </div>
  );
}

export default UserProfile;
