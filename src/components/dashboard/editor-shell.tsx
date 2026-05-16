"use client";

import { useState } from "react";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { PreviewIframe } from "@/components/dashboard/preview-iframe";
import { SortableLinkList } from "@/components/dashboard/sortable-link-list";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { UpdateProfileState } from "@/app/dashboard/actions";

type EditorShellProps = {
  username: string;
  initialProfile: {
    display_name: string | null;
    bio: string | null;
    avatar_url: string | null;
    accent_color: string;
  };
  links: { id: string; title: string; url: string }[];
};

type MobileTab = "editor" | "preview";

export function EditorShell({
  username,
  initialProfile,
  links,
}: EditorShellProps) {
  const [reloadKey, setReloadKey] = useState(0);
  const [mobileTab, setMobileTab] = useState<MobileTab>("editor");

  const bumpReload = (ts: number) => {
    if (ts !== reloadKey) setReloadKey(ts);
  };

  const handleProfileResult = (state: UpdateProfileState) => {
    if (state.status === "success") bumpReload(state.ts);
  };

  return (
    <div className="space-y-4">
      {/* Mobile Tab-Toggle — nur <md sichtbar */}
      <div
        role="tablist"
        aria-label="Editor oder Vorschau"
        className="grid grid-cols-2 gap-1 rounded-xl bg-muted p-1 md:hidden"
      >
        <TabButton
          active={mobileTab === "editor"}
          onClick={() => setMobileTab("editor")}
        >
          Editor
        </TabButton>
        <TabButton
          active={mobileTab === "preview"}
          onClick={() => setMobileTab("preview")}
        >
          Vorschau
        </TabButton>
      </div>

      {/* Layout: Mobile = Tab-Switch via hidden, Desktop = Split-Grid */}
      <div className="grid gap-6 md:grid-cols-[1fr_1.2fr]">
        <section
          aria-label="Profil-Editor"
          className={
            mobileTab === "editor"
              ? "space-y-8"
              : "hidden md:block md:space-y-8"
          }
        >
          <ProfileForm
            initialProfile={initialProfile}
            onResult={handleProfileResult}
          />
          <Separator />
          <SortableLinkList links={links} onPreviewReload={bumpReload} />
        </section>

        <section
          aria-label="Vorschau der Public-Page"
          className={mobileTab === "preview" ? "block" : "hidden md:block"}
        >
          <PreviewIframe username={username} reloadKey={reloadKey} />
        </section>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Button
      type="button"
      role="tab"
      aria-selected={active}
      variant={active ? "default" : "ghost"}
      onClick={onClick}
      className="w-full"
    >
      {children}
    </Button>
  );
}
