import Link from 'next/link';

export default function Home() {
  return (
    <>
      <h1>Next Data Hooks Example Repo</h1>
      <Link href="/blogs">
        <a>Go to Blog →</a>
      </Link>
    </>
  );
}
