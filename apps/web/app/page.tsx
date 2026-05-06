import { WikiCard } from '@/components/index';

const Home = () => {
  return (
    <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <WikiCard
        title="Complete Intro to React"
        author="Brian Holt"
        date="Sep 2025"
        summary="Learn React from the ground up with Brian Holt. Covers components, hooks, state, effects, and building modern UIs. Perfect for beginners and those wanting a solid foundation."
        href="/wiki/1"
      />
      <WikiCard
        title="Rust for TypeScript Developers"
        author="ThePrimeagen"
        date="Sep 2025"
        summary="ThePrimeagen teaches Rust to JavaScript/TypeScript devs. Dive into Rust's memory safety, ownership, and concurrency with fun, practical examples."
        href="/wiki/2"
      />
      <WikiCard
        title="API Design & Node.js"
        author="Scott Moss"
        date="Sep 2025"
        summary="Scott Moss covers building robust APIs with Node.js. Learn REST, authentication, testing, and best practices for scalable backend services."
        href="/wiki/3"
      />
      <WikiCard
        title="CSS Grid & Flexbox"
        author="Steve Kinney"
        date="Sep 2025"
        summary="Steve Kinney demystifies CSS Grid and Flexbox. Master layout techniques for responsive, modern web apps with hands-on demos and clear explanations."
        href="/wiki/4"
      />
    </div>
  );
};

export default Home;
