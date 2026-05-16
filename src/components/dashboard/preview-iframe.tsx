"use client";

type PreviewIframeProps = {
  username: string;
  /**
   * Bumpt sich bei jedem erfolgreichen Save (siehe `updateProfile` Action).
   * Über `key` triggert React ein Unmount + Re-Mount → frischer iframe-Load
   * mit revalidierter Server-Response.
   */
  reloadKey: number;
};

export function PreviewIframe({ username, reloadKey }: PreviewIframeProps) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <iframe
        key={reloadKey}
        src={`/u/${username}?preview=1`}
        title={`Vorschau von @${username}`}
        className="aspect-[9/16] w-full bg-background"
        sandbox="allow-same-origin allow-scripts"
      />
    </div>
  );
}
