"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Component() {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        Signed in as {session.user.email} <br />
        <button onClick={() => signOut()} className="bg-slate-900 p-4 mt-3">
          Sign out
        </button>
      </>
    );
  }
  return (
    <>
      <div className="">
        Not signed in <br />
        <button
          onClick={() => signIn()}
          className="bg-slate-900 p-4 m-3 text-white rounded"
        >
          Sign in
        </button>
      </div>
    </>
  );
}
