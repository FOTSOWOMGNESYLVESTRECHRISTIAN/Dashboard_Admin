import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { Switch } from "./ui/switch";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { API_ENDPOINTS } from "../utils/apiEndpoints";
import { API_BASE_URL } from "../utils/apiClient";

interface ProfileSettings {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  bio: string;
}

interface NotificationSettings {
  productUpdates: boolean;
  marketing: boolean;
  security: boolean;
  weeklySummary: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange: string;
  sessions: Array<{
    id: string;
    device: string;
    location: string;
    lastActive: string;
    current: boolean;
  }>;
}

export function Settings() {
  const [profile, setProfile] = useState<ProfileSettings>({
    firstName: "Alex",
    lastName: "Durand",
    email: "alex.durand@example.com",
    company: "TechNova",
    bio: "Responsable produit pour la suite d'applications TechNova.",
  });

  const [notifications, setNotifications] = useState<NotificationSettings>({
    productUpdates: true,
    marketing: false,
    security: true,
    weeklySummary: true,
  });

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    lastPasswordChange: "Il y a 42 jours",
    sessions: [
      {
        id: "session-1",
        device: "Chrome sur Windows",
        location: "Paris, France",
        lastActive: "Il y a 3 minutes",
        current: true,
      },
      {
        id: "session-2",
        device: "Safari sur iPhone",
        location: "Lyon, France",
        lastActive: "Il y a 2 jours",
        current: false,
      },
    ],
  });
  const [endpointFilter, setEndpointFilter] = useState("");
  const filteredEndpoints = useMemo(() => {
    if (!endpointFilter) return endpointCatalog;
    const term = endpointFilter.toLowerCase();
    return endpointCatalog.filter(
      (endpoint) =>
        endpoint.label.toLowerCase().includes(term) ||
        endpoint.method.toLowerCase().includes(term) ||
        endpoint.path.toLowerCase().includes(term),
    );
  }, [endpointFilter]);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="border-b border-yellow-500 pb-4">
        <h2 className="text-gray-900">Paramètres du compte</h2>
        <p className="text-gray-600">
          Gérez vos informations personnelles, vos préférences de notifications et la sécurité de votre compte.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card className="border-0 shadow-md overflow-hidden relative">
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
            <CardHeader>
              <CardTitle className="text-gray-900">Informations générales</CardTitle>
              <CardDescription className="text-gray-600">
                Utilisez un e-mail professionnel pour assurer une meilleure communication avec votre équipe.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(event) =>
                      setProfile((prev) => ({ ...prev, firstName: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(event) =>
                      setProfile((prev) => ({ ...prev, lastName: event.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Adresse e-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(event) =>
                    setProfile((prev) => ({ ...prev, email: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company">Entreprise</Label>
                <Input
                  id="company"
                  value={profile.company}
                  onChange={(event) =>
                    setProfile((prev) => ({ ...prev, company: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Biographie</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  rows={4}
                  onChange={(event) =>
                    setProfile((prev) => ({ ...prev, bio: event.target.value }))
                  }
                />
              </div>
              <div className="flex justify-end">
                <Button type="button" className="bg-[#1e3a5f] hover:bg-[#152d4a] text-white">Enregistrer les modifications</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="border-0 shadow-md overflow-hidden relative">
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
            <CardHeader>
              <CardTitle className="text-gray-900">Notifications par e-mail</CardTitle>
              <CardDescription className="text-gray-600">
                Choisissez les notifications que vous souhaitez recevoir dans votre boîte de réception.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                <div>
                  <h4 className="text-sm font-medium leading-none">
                    Nouveautés produit
                  </h4>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Soyez informé des nouvelles fonctionnalités et améliorations.
                  </p>
                </div>
                <Switch
                  checked={notifications.productUpdates}
                  onCheckedChange={(value) =>
                    setNotifications((prev) => ({ ...prev, productUpdates: value }))
                  }
                />
              </div>

              <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                <div>
                  <h4 className="text-sm font-medium leading-none">
                    Offres marketing
                  </h4>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Promotions et conseils pour optimiser vos campagnes.
                  </p>
                </div>
                <Switch
                  checked={notifications.marketing}
                  onCheckedChange={(value) =>
                    setNotifications((prev) => ({ ...prev, marketing: value }))
                  }
                />
              </div>

              <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                <div>
                  <h4 className="text-sm font-medium leading-none">
                    Alertes de sécurité
                  </h4>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Recevez une alerte lorsqu'une action sensible est détectée.
                  </p>
                </div>
                <Switch
                  checked={notifications.security}
                  onCheckedChange={(value) =>
                    setNotifications((prev) => ({ ...prev, security: value }))
                  }
                />
              </div>

              <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                <div>
                  <h4 className="text-sm font-medium leading-none">
                    Résumé hebdomadaire
                  </h4>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Recevez un résumé de vos indicateurs clés chaque lundi.
                  </p>
                </div>
                <Switch
                  checked={notifications.weeklySummary}
                  onCheckedChange={(value) =>
                    setNotifications((prev) => ({ ...prev, weeklySummary: value }))
                  }
                />
              </div>
              <div className="flex justify-end">
                <Button type="button" variant="outline">Réinitialiser</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="border-0 shadow-md overflow-hidden relative">
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
            <CardHeader>
              <CardTitle className="text-gray-900">Protection du compte</CardTitle>
              <CardDescription className="text-gray-600">
                Activez des protections supplémentaires pour sécuriser votre espace d'administration.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
                <div>
                  <h4 className="text-sm font-medium leading-none">
                    Authentification à deux facteurs
                  </h4>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Ajoutez une couche de sécurité supplémentaire lors de la connexion.
                  </p>
                </div>
                <Switch
                  checked={security.twoFactorEnabled}
                  onCheckedChange={(value) =>
                    setSecurity((prev) => ({ ...prev, twoFactorEnabled: value }))
                  }
                />
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="text-sm font-medium leading-none">
                  Mot de passe
                </h4>
                <p className="text-muted-foreground mt-1 text-sm">
                  Dernier changement : {security.lastPasswordChange}
                </p>
                <Button type="button" className="mt-4" variant="outline">
                  Mettre à jour le mot de passe
                </Button>
              </div>

              <div>
                <h4 className="text-sm font-medium leading-none">Sessions actives</h4>
                <p className="text-muted-foreground mt-1 text-sm">
                  Déconnectez les sessions que vous ne reconnaissez pas.
                </p>
                <Separator className="my-4" />
                <div className="space-y-3">
                  {security.sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{session.device}</p>
                        <p className="text-muted-foreground text-xs">
                          {session.location} • {session.lastActive}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {session.current ? (
                          <Badge variant="secondary">Session actuelle</Badge>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setSecurity((prev) => ({
                                ...prev,
                                sessions: prev.sessions.filter((s) => s.id !== session.id),
                              }))
                            }
                          >
                            Déconnecter
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card className="border-0 shadow-md overflow-hidden relative">
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
            <CardHeader>
              <CardTitle className="text-gray-900">Connexion à l'API FAROTY</CardTitle>
              <CardDescription className="text-gray-600">
                Base URL injectée via les variables d'environnement et prête pour les appels `fetch`.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>API Base URL</Label>
                <div className="flex gap-3">
                  <Input readOnly value={API_BASE_URL} className="font-mono" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigator.clipboard?.writeText(API_BASE_URL)}
                  >
                    Copier
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Personnalisez cette valeur via <code>VITE_API_BASE_URL</code>.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md overflow-hidden relative">
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
            <CardHeader>
              <CardTitle className="text-gray-900">Endpoints importés depuis Postman</CardTitle>
              <CardDescription className="text-gray-600">
                Chaque route provient de <code>FAROTY.postman_collection.json</code> et est prête à être
                consommée par le client API.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Filtrer par nom, méthode ou chemin..."
                value={endpointFilter}
                onChange={(event) => setEndpointFilter(event.target.value)}
                className="rounded-full border-primary/20"
              />
              <div className="max-h-[360px] overflow-auto rounded-2xl border border-primary/15">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-white/90 backdrop-blur">
                    <tr>
                      <th className="p-3 text-left text-xs uppercase tracking-widest text-muted-foreground">
                        Méthode
                      </th>
                      <th className="p-3 text-left text-xs uppercase tracking-widest text-muted-foreground">
                        Nom
                      </th>
                      <th className="p-3 text-left text-xs uppercase tracking-widest text-muted-foreground">
                        Chemin
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEndpoints.slice(0, 30).map((endpoint) => (
                      <tr key={endpoint.id} className="border-t">
                        <td className="p-3">
                          <Badge variant="outline" className="rounded-full px-3 py-1">
                            {endpoint.method}
                          </Badge>
                        </td>
                        <td className="p-3 font-semibold text-gray-900">{endpoint.label}</td>
                        <td className="p-3 font-mono text-xs text-muted-foreground">{endpoint.path}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground">
                {filteredEndpoints.length} endpoint(s) disponibles depuis la collection Postman initiale.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

