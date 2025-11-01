"use client";

const Login = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  };

  return (
    <div>
      <h1 className="text-center">Login</h1>
      <form
        className="flex flex-col items-center"
        onSubmit={handleSubmit}
        method="post"
      >
        <label htmlFor="username">Username</label>
        <input id="username" type="text" name="username"></input>
        <label htmlFor="password">Password</label>
        <input id="password" type="password" name="password"></input>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
