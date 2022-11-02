import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import GoogleButton from "react-google-button";

export default function Component() {
  const [subscriptions, setSubscriptions] = useState([]); //for caching
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  let searchText;

  // if (!session) {
  //   return (
  //     <>
  //       Not signed in <br />
  //       <button onClick={() => signIn("google")}>Sign in with google</button>
  //     </>
  //   );
  // }

  const submit = async (e) => {
    setLoading(true);
    e.preventDefault();
    searchText = e.target.searchText.value.trim().toLowerCase();
    const response = await fetch("/api/getSubscriptions");
    const data = await response.json();

    console.log(data);

    const subscriptionsWithReleventLinks = data.filter((sub) => {
      let relevantLinksIndex = [];
      sub.links.map((link, index) => {
        //check searchtext in channel links
        //populate relaventLinksIndex with exactly that
        //return true
        const searchTextExists =
          link["url"]?.toLowerCase().includes(searchText) ||
          link["title"]?.toLowerCase().includes(searchText);

        if (searchTextExists) {
          relevantLinksIndex.push(index);
        }
      });
      sub["relevantLinks"] = relevantLinksIndex;

      if (relevantLinksIndex.length > 0) {
        return true;
      }
      return false;
    });

    setLoading(false);
    console.log(subscriptionsWithReleventLinks, "SUBSCRIPTIONS RELEVENT LINKS");
    setSubscriptions(subscriptionsWithReleventLinks);
  };

  return (
    <div className="">
      <div className="p-4 flex justify-end">
        {!session ? (
          <GoogleButton
            onClick={() => {
              signIn("google");
            }}
            type="dark"
          />
        ) : (
          <button className="btn btn-error " onClick={() => signOut()}>
            Sign out
          </button>
        )}
      </div>
      <div className="mt-8 lg:w-3/5 md:w-4/5 p-4 w-full mx-auto">
        <div>
          <h1 class="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900">
            {session
              ? `Hello ${session.user.name}! let your search begin!`
              : "Find YouTube Creators"}
          </h1>
          <p>
            Here is a tool to find familer faces on other social media platforms
            than YouTube. Simply search for a platform —or a keyword. Make sure
            to allow permissions for reading your YouTube data when signing in.
          </p>
        </div>

        <form onSubmit={submit} className="mt-4">
          <div className="mb-2">
            <input
              type="text"
              name="searchText"
              placeholder="Type Keyword (twitter, github, etc)"
              className="input input-bordered w-full min-w-3/5 mb-2 "
              required
            />{" "}
            {session ? (
              <button
                type="submit"
                className="btn btn-primary btn-block min-w-3/5"
              >
                Search
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-primary btn-block min-w-3/5"
                disabled
              >
                Sign In to search
              </button>
            )}
          </div>
        </form>

        {loading ? "Loading..." : ""}
        {subscriptions.length > 0 ? (
          <div>
            <div class="fflex flex-wrap -m-4 mt-6">
              {subscriptions.map((sub, i) => {
                const { title, links, relevantLinks } = sub;

                return (
                  <div class=" p-4 md:text-left text-center" key={i}>
                    <h2 class="text-lg text-gray-900 font-medium title-font mb-2">
                      {title}
                    </h2>

                    <ul>
                      {relevantLinks.map((RL, i) => {
                        const renderLink = links[RL]["url"];
                        const renderLinkTitle = links[RL]["title"];
                        return (
                          <li key={i}>
                            <Link href={renderLink}>
                              <a class="mt-3 text-blue-700 hover:text-red-800 inline-flex items-center underline">
                                {renderLink}
                              </a>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
// on submit
// get inputtext from input and get subscriptions links
// filter subs based on serchText
//sort links based on searchText inot relevant links array
