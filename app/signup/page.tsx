"use client";

const Signup = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex gap-10 justify-center flex-col">
      <h1 className="text-center text-red-500">SIGN UP</h1>
      <form
        className="flex flex-col gap-2 items-center"
        onSubmit={handleSubmit}
        method="post"
      >
        <label htmlFor="username">Username</label>
        <input id="username" type="text" name="username"></input>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" name="password"></input>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" name="email"></input>
        <select>
          <option value="">--Please choose a country--</option>
          <option value="usa">United States</option>
          <option value="canada">Canada</option>
          <option value="uk">United Kingdom</option>
          <option value="australia">Australia</option>
          <option value="germany">Germany</option>
          <option value="france">France</option>
          <option value="japan">Japan</option>
          <option value="china">China</option>
          <option value="india">India</option>
          <option value="brazil">Brazil</option>
          <option value="pakistan">Pakistan</option>
        </select>
        <button type="submit" className="hover:bg-red-500">
          Signup
        </button>
      </form>
    </div>
  );
};

export default Signup;
