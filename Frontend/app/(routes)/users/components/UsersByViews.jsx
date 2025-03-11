"use client";

import GroupUsersView from './GroupUsersView';
import CareerUsersView from './CareerUsersView';

export default function UsersByViews({ users }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <GroupUsersView users={users} />
      <CareerUsersView users={users} />
    </div>
  );
}
