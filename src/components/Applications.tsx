import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Search, Plus, MoreHorizontal, Edit, Trash2, Eye, Filter, Download } from "lucide-react";
import type { Application } from "./ApplicationDetails";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner@2.0.3";

const mockApplications: Application[] = [
  {
    id: "1",
    name: "TaskMaster Pro",
    category: "Productivité",
    version: "2.4.1",
    status: "active",
    subscriptions: 1234,
    lastUpdate: "2024-11-10",
    description: "Application de gestion de tâches et de productivité avec collaboration en temps réel",
    plans: [],
    features: [],
  },
  {
    id: "2",
    name: "GameZone Ultra",
    category: "Jeux",
    version: "1.8.0",
    status: "active",
    subscriptions: 892,
    lastUpdate: "2024-11-08",
    description: "Plateforme de jeux multijoueurs avec chat intégré et classements",
    plans: [],
    features: [],
  },
  {
    id: "3",
    name: "SocialHub",
    category: "Social",
    version: "3.2.5",
    status: "maintenance",
    subscriptions: 2341,
    lastUpdate: "2024-11-05",
    description: "Réseau social innovant avec partage de contenu multimédia",
    plans: [],
    features: [],
  },
  {
    id: "4",
    name: "LearnPlus",
    category: "Éducation",
    version: "1.5.2",
    status: "active",
    subscriptions: 567,
    lastUpdate: "2024-11-12",
    description: "Plateforme d'apprentissage en ligne avec cours interactifs",
    plans: [],
    features: [],
  },
  {
    id: "5",
    name: "FitTracker",
    category: "Santé",
    version: "2.1.0",
    status: "inactive",
    subscriptions: 123,
    lastUpdate: "2024-10-28",
    description: "Application de suivi de fitness et santé personnalisée",
    plans: [],
    features: [],
  },
  {
    id: "6",
    name: "MusicStream",
    category: "Divertissement",
    version: "4.0.3",
    status: "active",
    subscriptions: 3456,
    lastUpdate: "2024-11-11",
    description: "Service de streaming musical avec millions de titres",
    plans: [],
    features: [],
  },
];

const statusColors = {
  active: "bg-green-600",
  inactive: "bg-gray-400",
  maintenance: "bg-amber-500",
};

const statusLabels = {
  active: "Actif",
  inactive: "Inactif",
  maintenance: "Maintenance",
};

interface ApplicationsProps {
  onViewDetails?: (app: Application) => void;
}

export function Applications({ onViewDetails }: ApplicationsProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [applications, setApplications] = useState<Application[]>(mockApplications);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    version: "",
    status: "active" as "active" | "inactive" | "maintenance",
    subscriptions: 0,
    description: "",
  });

  const filteredApplications = applications.filter((app) =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      version: "",
      status: "active",
      subscriptions: 0,
      description: "",
    });
  };

  const handleAddApplication = () => {
    const newApp: Application = {
      id: (applications.length + 1).toString(),
      name: formData.name,
      category: formData.category,
      version: formData.version,
      status: formData.status,
      subscriptions: formData.subscriptions,
      lastUpdate: new Date().toISOString().split("T")[0],
      description: formData.description,
      plans: [],
      features: [],
    };
    setApplications([...applications, newApp]);
    setIsAddDialogOpen(false);
    resetForm();
    toast.success("Application ajoutée avec succès!");
  };

  const handleEditApplication = () => {
    if (!selectedApp) return;
    
    setApplications(
      applications.map((app) =>
        app.id === selectedApp.id
          ? {
              ...app,
              name: formData.name,
              category: formData.category,
              version: formData.version,
              status: formData.status,
              subscriptions: formData.subscriptions,
              description: formData.description,
              lastUpdate: new Date().toISOString().split("T")[0],
            }
          : app
      )
    );
    setIsEditDialogOpen(false);
    setSelectedApp(null);
    resetForm();
    toast.success("Application modifiée avec succès!");
  };

  const handleDeleteApplication = () => {
    if (!selectedApp) return;
    
    setApplications(applications.filter((app) => app.id !== selectedApp.id));
    setIsDeleteDialogOpen(false);
    setSelectedApp(null);
    toast.success("Application supprimée avec succès!");
  };

  const openEditDialog = (app: Application) => {
    setSelectedApp(app);
    setFormData({
      name: app.name,
      category: app.category,
      version: app.version,
      status: app.status,
      subscriptions: app.subscriptions,
      description: app.description,
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (app: Application) => {
    if (onViewDetails) {
      onViewDetails(app);
    }
  };

  const openDeleteDialog = (app: Application) => {
    setSelectedApp(app);
    setIsDeleteDialogOpen(true);
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  return (
    <div className="space-y-6 h-full flex flex-col overflow-hidden">
      {/* En-tête avec bordure jaune */}
      <div className="border-b border-yellow-500 pb-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-gray-900">Liste des Applications</h2>
          <p className="text-gray-600">
            Gérez toutes vos applications en un seul endroit
          </p>
        </div>
        <Button onClick={openAddDialog} className="bg-[#1e3a5f] hover:bg-[#152d4a] text-white">
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle Application
        </Button>
      </div>

      {/* Carte principale avec bordure jaune en bas */}
      <Card className="flex-1 flex flex-col overflow-hidden border-0 shadow-md relative">
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-yellow-500"></div>
        <CardHeader className="flex-shrink-0">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="text-gray-900">Applications</CardTitle>
              <CardDescription className="text-gray-600">
                {filteredApplications.length} application(s) trouvée(s)
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="bg-gray-50 hover:bg-gray-100 text-gray-700 border-0 h-9"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filtres
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-gray-50 hover:bg-gray-100 text-gray-700 border-0 h-9"
              >
                <Download className="mr-2 h-4 w-4" />
                Exporter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col overflow-hidden">
          <div className="mb-4 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une application..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-50 border-0"
              />
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 overflow-hidden flex-1 min-h-0 bg-white">
            <div className="h-full overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-gray-50 z-10">
                  <TableRow className="hover:bg-gray-50 border-b border-gray-200">
                    <TableHead className="text-gray-700 whitespace-nowrap min-w-[150px]">Nom</TableHead>
                    <TableHead className="text-gray-700 whitespace-nowrap min-w-[120px]">Catégorie</TableHead>
                    <TableHead className="text-gray-700 whitespace-nowrap min-w-[80px]">Version</TableHead>
                    <TableHead className="text-gray-700 whitespace-nowrap min-w-[100px]">Statut</TableHead>
                    <TableHead className="text-right text-gray-700 whitespace-nowrap min-w-[110px]">Subscriptions</TableHead>
                    <TableHead className="text-gray-700 whitespace-nowrap min-w-[110px]">Dernière MAJ</TableHead>
                    <TableHead className="text-right text-gray-700 whitespace-nowrap min-w-[70px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                        Aucune application trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredApplications.map((app) => (
                      <TableRow key={app.id} className="hover:bg-gray-50 border-b border-gray-100">
                        <TableCell className="whitespace-nowrap text-gray-900">{app.name}</TableCell>
                        <TableCell className="whitespace-nowrap text-gray-600">{app.category}</TableCell>
                        <TableCell className="whitespace-nowrap text-gray-600">{app.version}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge
                            variant="secondary"
                            className={`${statusColors[app.status]} text-white`}
                          >
                            {statusLabels[app.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap text-gray-900">
                          {app.subscriptions.toLocaleString()}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-gray-600">
                          {new Date(app.lastUpdate).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })}
                        </TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openViewDialog(app)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Voir les détails
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(app)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => openDeleteDialog(app)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 flex-shrink-0">
            <div className="text-sm text-gray-500">
              Chargement...
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled
                className="bg-gray-50 hover:bg-gray-100 text-gray-700 border-0"
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled
                className="bg-gray-50 hover:bg-gray-100 text-gray-700 border-0"
              >
                Suivant
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog Ajouter une application */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle application</DialogTitle>
            <DialogDescription>
              Remplissez les informations de la nouvelle application
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="add-name">Nom de l'application</Label>
              <Input
                id="add-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: TaskMaster Pro"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-category">Catégorie</Label>
              <Input
                id="add-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ex: Productivité"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-version">Version</Label>
              <Input
                id="add-version"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="Ex: 1.0.0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-status">Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "inactive" | "maintenance") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger id="add-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-subscriptions">Nombre de subscriptions</Label>
              <Input
                id="add-subscriptions"
                type="number"
                value={formData.subscriptions}
                onChange={(e) =>
                  setFormData({ ...formData, subscriptions: parseInt(e.target.value) || 0 })
                }
                placeholder="Ex: 100"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="add-description">Description</Label>
              <Textarea
                id="add-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Ex: Application de gestion..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleAddApplication}
              className="bg-[#8b68a6] hover:bg-[#6b4685]"
              disabled={!formData.name || !formData.category || !formData.version}
            >
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Modifier une application */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Modifier l'application</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'application
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nom de l'application</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: TaskMaster Pro"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-category">Catégorie</Label>
              <Input
                id="edit-category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Ex: Productivité"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-version">Version</Label>
              <Input
                id="edit-version"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                placeholder="Ex: 1.0.0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Statut</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "active" | "inactive" | "maintenance") =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-subscriptions">Nombre de subscriptions</Label>
              <Input
                id="edit-subscriptions"
                type="number"
                value={formData.subscriptions}
                onChange={(e) =>
                  setFormData({ ...formData, subscriptions: parseInt(e.target.value) || 0 })
                }
                placeholder="Ex: 100"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Ex: Application de gestion..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleEditApplication}
              className="bg-[#8b68a6] hover:bg-[#6b4685]"
              disabled={!formData.name || !formData.category || !formData.version}
            >
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog Supprimer */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'application "{selectedApp?.name}" sera
              définitivement supprimée de la base de données.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteApplication}
              className="bg-destructive hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}