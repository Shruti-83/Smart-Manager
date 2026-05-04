import React from 'react'

function Navbar({ setSearchQuery }) {
  return (
    <div className="navbar bg-base-100 shadow-md justify-center text-white">
      <div className="form-control">
        <input
          type="text"
          placeholder="Search tasks..."
          className="input input-bordered w-80"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
}

export default Navbar