type ProfileHeaderProps = {
  profile: {
    username: string;
    display_name: string | null;
    bio: string | null;
    avatar_url: string | null;
  };
};

/**
 * Public-Profile-Header: Avatar + Display-Name + Bio.
 *
 * Wird in Spec 04 vom iframe-Preview im Dashboard geladen
 * und in Spec 06 für die echte Public-Page weiterverwendet.
 *
 * Layout-Constraints aus Spec 06 Akzeptanzkriterien:
 *   - Avatar: 96px Mobile / 112px Desktop, `rounded-full`
 *   - Display-Name: `text-2xl font-semibold`, zentriert
 *   - Bio: `text-base text-muted-foreground`, zentriert
 */
export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const { username, display_name, bio, avatar_url } = profile;

  return (
    <header className="flex flex-col items-center gap-4 text-center">
      {avatar_url ? (
        <img
          src={avatar_url}
          alt={display_name ?? `@${username}`}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="h-24 w-24 md:h-28 md:w-28 rounded-full object-cover"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex h-24 w-24 items-center justify-center rounded-full bg-muted text-3xl font-medium text-muted-foreground md:h-28 md:w-28 md:text-4xl"
        >
          {(display_name?.[0] ?? username[0]).toUpperCase()}
        </div>
      )}

      <h1 className="text-2xl font-semibold tracking-tight">
        {display_name ?? `@${username}`}
      </h1>

      {bio ? (
        <p className="max-w-xs text-base text-muted-foreground">{bio}</p>
      ) : null}
    </header>
  );
}
