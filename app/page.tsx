import Link from "next/link";

const Home = () => {
  return (
    <div>
      it is home
      <ul>
        <li>
          <Link href="/about">About us</Link>
        </li>
      </ul>
    </div>
  );
};

export default Home;
