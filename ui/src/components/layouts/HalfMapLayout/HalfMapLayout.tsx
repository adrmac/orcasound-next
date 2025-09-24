import { Box, Button, Theme, useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import React, { ReactElement, useEffect, useRef } from "react";

import { CandidatesStack } from "@/components/CandidateList/CandidatesStack";
import { HydrophonesStack } from "@/components/CandidateList/HydrophonesStack";
import MobileTabs from "@/components/CandidateList/MobileTabs";
import HeaderNew from "@/components/HeaderNew";
import LivePlayer from "@/components/PlayBar/LivePlayer";
import { useLayout } from "@/context/LayoutContext";
import { useNowPlaying } from "@/context/NowPlayingContext";

import { MasterDataLayout } from "../MasterDataLayout";
import { BottomDrawer } from "./BottomDrawer";
import { FeedDetail } from "./FeedDetail";
import { MapWrapper } from "./MapWrapper";
import MobileDrawer from "./MobileDrawer";
import { SideList } from "./SideList";

const mainTabs = [
  { label: "Hydrophones", href: "/beta" },
  { label: "Explore", href: "/beta/explore" },
  { label: "Take Action", href: "/beta/action" },
];

const tabButtonSx = {
  padding: "7px 16px",
  margin: "0 8px",
  minWidth: 0,
  minHeight: "unset",
  lineHeight: 1.2,
  borderRadius: "4px",
  textTransform: "uppercase",
  color: "inherit",
  "&:hover": {
    color: "primary.main",
    backgroundColor: "rgba(255,255,255,.10)",
  },
};

const activeButtonSx = {
  backgroundColor: "rgba(255,255,255,.15)",
  "&:hover": {
    backgroundColor: "rgba(255,255,255,.18)",
  },
};

function NavTabs({ mdDown }: { mdDown?: boolean }) {
  const router = useRouter();
  const currentPath = router.pathname;

  return (
    <Box
      role="navigation"
      aria-label="Main navigation"
      display="flex"
      justifyContent={mdDown ? "center" : "start"}
    >
      {mainTabs.map(({ label, href }, index) => {
        let isActive;
        if (currentPath === href) {
          isActive = true;
        } else if (
          (currentPath === "/" || !!router.query.feedSlug) &&
          index == 0
        ) {
          isActive = true;
        } else {
          isActive = false;
        }

        return (
          <Button
            key={href}
            sx={{ ...tabButtonSx, ...(isActive ? activeButtonSx : {}) }}
            onClick={() => router.push(href)}
            aria-current={isActive ? "page" : undefined}
          >
            {label}
          </Button>
        );
      })}
    </Box>
  );
}

type HalfMapLayoutProps = {
  children?: React.ReactNode;
};

export function HalfMapLayout({ children }: HalfMapLayoutProps) {
  const router = useRouter();
  const { setDrawerSide, drawerContent, showPlayPrompt, activeMobileTab } =
    useLayout();
  const { nowPlayingFeed } = useNowPlaying();
  const isHome = router.asPath === mainTabs[0].href || router.asPath === "/";
  const isNode = router.query.feedSlug;

  const isExplore = router.asPath === mainTabs[1].href;
  const isAction = router.asPath === mainTabs[2].href;

  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  const masterPlayerTimeRef = useRef(0);

  useEffect(() => {
    if (!router) return;
    if (router.query.candidateId) {
      setDrawerSide("left");
    } else {
      setDrawerSide("right");
    }
  }, [setDrawerSide, router]);

  const isSafari =
    typeof window !== "undefined" &&
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  const playPrompt = (
    <Box
      className="play-prompt"
      sx={{
        // to make this work I need to set up a new state variable that turns off/on from the playerbase
        // too much complexity for now...
        backgroundColor: "rgba(0,0,0,.75)",
        color: "rgba(255,255,255,.9)",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px 24px",
        borderRadius: "8px",
      }}
    >
      {isSafari ? (
        <div style={{ textAlign: "center" }}>
          Visualizer not supported in this browser, please try Chrome.
        </div>
      ) : (
        "Press play to start visualizer and report sounds"
      )}
    </Box>
  );

  const mobileTabs = [
    {
      label: "Listen live",
      value: "hydrophones",
      content: (
        <>
          <HydrophonesStack />
        </>
      ),
    },
    {
      label: "Last 7 days",
      value: "reports",
      content: <CandidatesStack showChart={true} />,
    },
    {
      label: "Map view",
      value: "map",
      content: (
        <>
          <MapWrapper key={`mobile-${router.asPath}`} />
          <MobileDrawer masterPlayerTimeRef={masterPlayerTimeRef} />
        </>
      ),
    },
  ];

  return (
    <>
      <Box
        sx={{
          // use `dvh` for dynamic viewport height to handle mobile browser weirdness
          // but fallback to `vh` for browsers that don't support `dvh`
          // `&` is a workaround because sx prop can't have identical keys
          // "&": {
          //   height: "100dvh",
          // },
          // height: "100vh",
          // paddingBottom: mdDown ? "155px" : "86px",
          // paddingTop: "60px", // added this due to making header position: fixed
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          minHeight: 0, // important for mobile scrolling
        }}
      >
        <HeaderNew tabs={<NavTabs />} />

        {/* children are only used in this layout so individual pages can run logic on load */}
        {children}

        <Box
          component="main"
          sx={{
            display: "flex",
            flexFlow: mdDown ? "column" : "row",
            flex: 1,
            position: "relative",
            overflowY: mdDown ? "scroll" : "hidden",
          }}
        >
          {/* mobile view */}
          {mdDown && (
            <>
              <MobileTabs tabs={mobileTabs} />
            </>
          )}

          {/* // desktop view */}
          {!mdDown && (
            <>
              <SideList position="left">
                {router.query.feedSlug ? (
                  <FeedDetail />
                ) : isHome || isNode ? (
                  <LivePlayer
                    showListView={true}
                    feed={nowPlayingFeed}
                    key={router.asPath}
                  />
                ) : isExplore ? (
                  <></>
                ) : (
                  <></>
                )}
              </SideList>

              <Box
                className="center-column"
                sx={{
                  display: "flex",
                  flexGrow: 1,
                  position: "relative",
                  width: "50%",
                }}
              >
                {isExplore ? (
                  <div style={{ overflow: "auto" }}>
                    <CandidatesStack />
                  </div>
                ) : (
                  <MapWrapper />
                )}
              </Box>
              <SideList position="right">
                {isHome || isNode ? (
                  <CandidatesStack showChart={true} />
                ) : isExplore ? (
                  <></>
                ) : (
                  <></>
                )}
              </SideList>
            </>
          )}
        </Box>
        {/* Getting rid of mobile bottom nav */}
        {/* {mdDown && <MobileBottomNav />} */}

        {/* hiding the bottom drawer on the mobile map view because the LivePlayer itself expands instead */}
        {(!mdDown || activeMobileTab?.value !== "map") && (
          <BottomDrawer>
            {!mdDown && nowPlayingFeed && showPlayPrompt && playPrompt}
            {drawerContent}
          </BottomDrawer>
        )}
      </Box>
    </>
  );
}

export function getHalfMapLayout(page: ReactElement) {
  return (
    <MasterDataLayout>
      <HalfMapLayout>{page}</HalfMapLayout>
    </MasterDataLayout>
  );
}
