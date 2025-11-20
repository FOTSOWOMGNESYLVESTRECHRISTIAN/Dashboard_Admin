import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { ArrowLeft, User, Mail, Shield, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import { User as UserType } from "./Users";

interface UserDetailsProps {
  user: UserType;
  onBack: () => void;
}

const statusColors = {
  active: "bg-green-600",
  inactive: "bg-gray-400",
  suspended: "bg-red-500",
};

const statusLabels = {
  active: "Actif",
  inactive: "Inactif",
  suspended: "Suspendu",
};

const roleLabels = {
  admin: "Administrateur",
  user: "Utilisateur",
  moderator: "Modérateur",
};

const mockSubscriptionsData = [
  { id: "1", contextName: "Équipe Marketing TechCorp", application: "TaskMaster Pro", status: "active" },
  { id: "2", contextName: "Startup Innovante", application: "SocialHub", status: "active" },
];

const mockApplicationsData = [
  { id: "1", name: "TaskMaster Pro", category: "Productivité", status: "active" },
  { id: "3", name: "SocialHub", category: "Social", status: "active" },
];

export function UserDetails({ user, onBack }: UserDetailsProps) {
  const userSubscriptions = mockSubscriptionsData.filter((sub) =>
    user.subscriptions.includes(sub.id)
  );
  const userApplications = mockApplicationsData.filter((app) =>
    user.applications.includes(app.id)
  );

  const heroStats = [
    {
      label: "Rôle",
      value: roleLabels[user.role],
      helper: "Privilèges attribués",
    },
    {
      label: "Statut",
      value: statusLabels[user.status],
      helper: "État du compte",
    },
    {
      label: "Applications",
      value: userApplications.length,
      helper: "Accès actifs",
    },
    {
      label: "Dernière connexion",
      value: user.lastLogin
        ? new Date(user.lastLogin).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "Jamais",
      helper: "Traçabilité",
    },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="border-b border-yellow-500 pb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
          <div>
            <h2 className="text-gray-900">{user.name}</h2>
            <p className="text-gray-600">Détails de l'utilisateur</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {heroStats.map((stat) => (
            <Card key={stat.label} className="border-0 shadow-md overflow-hidden relative">
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
              <CardContent className="pt-6">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500">{stat.label}</p>
                <p className="mt-2 text-2xl font-semibold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-600">{stat.helper}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Informations générales */}
      <Card className="border-0 shadow-md overflow-hidden relative">
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
        <CardHeader>
          <CardTitle className="text-gray-900">Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                Nom complet
              </Label>
              <div className="mt-1 font-medium">{user.name}</div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <div className="mt-1 font-medium">{user.email}</div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Rôle
              </Label>
              <div className="mt-1">
                <Badge variant="outline">{roleLabels[user.role]}</Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground flex items-center gap-2">
                {user.status === "active" ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                Statut
              </Label>
              <div className="mt-1">
                <Badge
                  variant="secondary"
                  className={`${statusColors[user.status]} text-white`}
                >
                  {statusLabels[user.status]}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date de création
              </Label>
              <div className="mt-1">
                {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </div>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Dernière connexion
              </Label>
              <div className="mt-1">
                {user.lastLogin
                  ? new Date(user.lastLogin).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Jamais connecté"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions */}
      <Card className="border-0 shadow-md overflow-hidden relative">
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
        <CardHeader>
          <CardTitle className="text-gray-900">Subscriptions ({userSubscriptions.length})</CardTitle>
          <CardDescription className="text-gray-600">
            Subscriptions actives de cet utilisateur
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userSubscriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune subscription
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <div className="max-h-[300px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-0">
                    <TableRow>
                      <TableHead className="whitespace-nowrap min-w-[200px]">Contexte</TableHead>
                      <TableHead className="whitespace-nowrap min-w-[150px]">Application</TableHead>
                      <TableHead className="whitespace-nowrap min-w-[100px]">Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userSubscriptions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="whitespace-nowrap font-medium">
                          {sub.contextName}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {sub.application}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge
                            variant="secondary"
                            className="bg-green-600 text-white"
                          >
                            {sub.status === "active" ? "Actif" : "Inactif"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Applications */}
      <Card className="border-0 shadow-md overflow-hidden relative">
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
        <CardHeader>
          <CardTitle className="text-gray-900">Applications ({userApplications.length})</CardTitle>
          <CardDescription className="text-gray-600">
            Applications auxquelles cet utilisateur a accès
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userApplications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucune application
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {userApplications.map((app) => (
                <div
                  key={app.id}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">{app.name}</div>
                    <Badge variant="outline">
                      {app.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant="secondary"
                      className="bg-green-600 text-white"
                    >
                      {app.status === "active" ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

