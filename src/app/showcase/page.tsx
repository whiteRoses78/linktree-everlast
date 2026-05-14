"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

const profileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Mindestens 2 Zeichen")
    .max(50, "Höchstens 50 Zeichen"),
  username: z
    .string()
    .min(3, "Mindestens 3 Zeichen")
    .max(30, "Höchstens 30 Zeichen")
    .regex(/^[a-z0-9_-]+$/, "Nur Kleinbuchstaben, Zahlen, _ und -"),
  bio: z.string().max(160, "Höchstens 160 Zeichen").optional(),
  url: z.string().url("Bitte eine gültige URL"),
})

type ProfileValues = z.infer<typeof profileSchema>

const themeSwatches = [
  { token: "background", label: "Background", text: "foreground" },
  { token: "card", label: "Card", text: "card-foreground" },
  { token: "primary", label: "Primary", text: "primary-foreground" },
  { token: "secondary", label: "Secondary", text: "secondary-foreground" },
  { token: "muted", label: "Muted", text: "muted-foreground" },
  { token: "accent", label: "Accent", text: "accent-foreground" },
  { token: "destructive", label: "Destructive", text: "destructive-foreground" },
] as const

const buttonVariants = ["default", "secondary", "outline", "ghost", "destructive", "link"] as const
const buttonSizes = ["sm", "default", "lg"] as const

export default function ShowcasePage() {
  const [submitted, setSubmitted] = useState<ProfileValues | null>(null)

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { displayName: "", username: "", bio: "", url: "" },
  })

  function onSubmit(values: ProfileValues) {
    setSubmitted(values)
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto max-w-4xl px-4 py-12 sm:py-16">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Component Showcase
          </h1>
          <p className="text-muted-foreground">
            Smoke-Test für Theme + shadcn-Components. Hover und Focus auf jedem
            interaktiven Element prüfen.
          </p>
        </header>

        <Separator className="my-10" />

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Theme-Tokens</h2>
          <p className="text-sm text-muted-foreground">
            Wenn Primary grün leuchtet und Background ein leichter Blau-Stich
            hat, ist das tweakcn-Theme aktiv.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {themeSwatches.map((s) => (
              <div
                key={s.token}
                className="flex h-20 flex-col justify-end rounded-lg border border-border p-3"
                style={{
                  backgroundColor: `var(--${s.token})`,
                  color: `var(--${s.text})`,
                }}
              >
                <span className="text-sm font-medium">{s.label}</span>
                <span className="text-xs opacity-70">--{s.token}</span>
              </div>
            ))}
          </div>
        </section>

        <Separator className="my-10" />

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            {buttonVariants.map((v) => (
              <Button key={v} variant={v}>
                {v}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {buttonSizes.map((s) => (
              <Button key={s} size={s}>
                size={s}
              </Button>
            ))}
            <Button disabled>disabled</Button>
          </div>
        </section>

        <Separator className="my-10" />

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Cards</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Kuratierter Link</CardTitle>
                <CardDescription>
                  So sieht ein einzelner Link auf einer Profilseite aus.
                </CardDescription>
                <CardAction>
                  <Button variant="ghost" size="sm">
                    Bearbeiten
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Klicks heute: <span className="text-foreground">42</span>
                </p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button size="sm">Öffnen</Button>
                <Button variant="outline" size="sm">
                  Teilen
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Empty State</CardTitle>
                <CardDescription>
                  Noch keine Links angelegt – leg los, dein erstes Schaufenster
                  wartet.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button>Ersten Link hinzufügen</Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        <Separator className="my-10" />

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Input + Label (standalone)</h2>
          <div className="grid gap-3 sm:max-w-sm">
            <Label htmlFor="demo-email">E-Mail</Label>
            <Input
              id="demo-email"
              type="email"
              placeholder="du@example.com"
            />
          </div>
        </section>

        <Separator className="my-10" />

        <section className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold">Profil-Form</h2>
            <p className="text-sm text-muted-foreground">
              Vollständiges Form-Setup mit react-hook-form + zod – wird im
              Auth-Feature genauso aussehen.
            </p>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="grid gap-6 sm:max-w-lg"
            >
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anzeigename</FormLabel>
                    <FormControl>
                      <Input placeholder="Marco Lemke" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="marco" {...field} />
                    </FormControl>
                    <FormDescription>
                      Wird zu linktree-app.dev/{field.value || "username"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ein kurzer Satz über dich" {...field} />
                    </FormControl>
                    <FormDescription>
                      {(field.value?.length ?? 0)}/160 Zeichen
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Erster Link</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-3">
                <Button type="submit">Speichern</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    form.reset()
                    setSubmitted(null)
                  }}
                >
                  Zurücksetzen
                </Button>
              </div>
            </form>
          </Form>

          {submitted && (
            <Card className="sm:max-w-lg">
              <CardHeader>
                <CardTitle>Submitted ✓</CardTitle>
                <CardDescription>
                  Diese Werte würden an Supabase gehen:
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs text-muted-foreground">
                  {JSON.stringify(submitted, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </section>
      </div>
    </main>
  )
}
