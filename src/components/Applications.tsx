// src/pages/admin/Application.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Plus, Edit, Trash, Filter, Download, Search, Check, Clock, Infinity } from "lucide-react";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableCaption } from "../components/ui/table";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  applicationService,
  Application,
  ApplicationPayload,
} from "../services/applicationService";

type StringField = Exclude<keyof ApplicationPayload, "configuration">;

const buildEmptyForm = (): ApplicationPayload => ({
  name: "",
  description: "",
  version: "",
  type: "web",
  platform: "web",
  iconUrl: "",
  websiteUrl: "",
  supportEmail: "",
  documentationUrl: "",
  configuration: null,
});

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
};

const getInitials = (value?: string | null) =>
  (value || "APP")
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

const statusColorMap: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-700 border-emerald-200",
  inactive: "bg-slate-100 text-slate-600 border-slate-200",
  maintenance: "bg-amber-100 text-amber-700 border-amber-200",
};

type StatusFilterType = "all" | "active" | "inactive" | "maintenance";

const statusLabelsMap: Record<StatusFilterType, string> = {
  all: "Toutes",
  active: "Actives",
  inactive: "Inactives",
  maintenance: "Maintenance",
};

const formatStatus = (status?: string | null) => {
  if (!status) return "Inconnu";
  return status.replace(/_/g, " ").toLowerCase();
};

interface ApplicationsProps {
  onViewDetails?: (app: Application) => void;
}

export function Applications({ onViewDetails }: ApplicationsProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Dialogs
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Form
  const [formData, setFormData] = useState<ApplicationPayload>(buildEmptyForm());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("all");
  const [isExporting, setIsExporting] = useState(false);

  // ------------------------------
  // 1️⃣ Charger les applications
  // ------------------------------
  useEffect(() => {
    const loadApplications = async () => {
      try {
        setLoading(true);
        const data = await applicationService.getAllApplications();
        console.log("[Applications] Loaded applications:", data);
        setApplications(data);
      } catch (error: any) {
        console.error("[Applications] Error loading applications:", error);
        toast.error(error?.message || "Erreur lors du chargement des applications");
      } finally {
        setLoading(false);
      }
    };

    loadApplications();
  }, []);

  // ------------------------------
  // 2️⃣ Ajouter une application
  // ------------------------------
  const handleAddApplication = async () => {
    try {
      const newApp = await applicationService.addApplication(formData);
      setApplications(prev => [...prev, newApp]);

      toast.success("Application ajoutée !");
      setIsAddOpen(false);

      setFormData(buildEmptyForm());
    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de l'ajout");
    }
  };

  // ------------------------------
  // 3️⃣ Modifier une application
  // ------------------------------
  const handleEditApplication = async () => {
    if (!selectedApp) return;

    try {
      const updated = await applicationService.updateApplication(selectedApp.id, formData);

      setApplications(prev => prev.map(app => app.id === selectedApp.id ? updated : app));

      toast.success("Application modifiée !");
      setIsEditOpen(false);

    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de la modification");
    }
  };

  // ------------------------------
  // 4️⃣ Supprimer une application
  // ------------------------------
  const handleDeleteApplication = async () => {
    if (!selectedApp) return;

    try {
      await applicationService.deleteApplication(selectedApp.id);

      setApplications(prev => prev.filter(app => app.id !== selectedApp.id));

      toast.success("Application supprimée !");
      setIsDeleteOpen(false);

    } catch (err: any) {
      toast.error(err?.message || "Erreur lors de la suppression");
    }
  };

  const handleExportToExcel = async () => {
    if (filteredApplications.length === 0) {
      toast.error("Aucune donnée à exporter");
      return;
    }

    try {
      setIsExporting(true);
      const XLSX = await import("xlsx");
      const data = filteredApplications.map((app) => ({
        Nom: app.name,
        Description: app.description || "",
        Type: app.type || "",
        Plateforme: app.platform || "",
        Version: app.version || "",
        Statut: formatStatus(app.status),
        "Créée le": formatDate(app.createdAt),
      }));
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
      const timestamp = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(workbook, `applications-${timestamp}.xlsx`);
      toast.success("Export Excel réalisé");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Échec de l'export");
    } finally {
      setIsExporting(false);
    }
  };

  const handleInputChange = (field: StringField, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const filteredApplications = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return applications.filter((app) => {
      const matchesSearch =
        term === "" ||
        app.name?.toLowerCase().includes(term) ||
        app.description?.toLowerCase().includes(term) ||
        app.type?.toLowerCase().includes(term) ||
        app.platform?.toLowerCase().includes(term);
      const matchesStatus =
        statusFilter === "all" ||
        (app.status || "inactive").toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [applications, searchTerm, statusFilter]);

  // ------------------------------
  // Pagination calculs
  // ------------------------------
  const indexLast = currentPage * itemsPerPage;
  const indexFirst = indexLast - itemsPerPage;
  const currentItems = filteredApplications.slice(indexFirst, indexLast);
  const totalPages = Math.max(1, Math.ceil(filteredApplications.length / itemsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-3">
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 text-black p-6 flex flex-col gap-4 shadow-[0_25px_70px_rgba(5,10,30,0.35)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="uppercase tracking-[0.35em] text-3xl text-black font-semibold">Applications</p>
            <h1 className="text-xl">Centre de gestion</h1>
            <p className="text-white/70 text-base max-w-2xl mt-1">
              Administrez vos apps, ajoutez des fonctionnalités et publiez des plans avec un style distinct.
            </p>
          </div>
        {/* <div className="flex flex-wrap items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="rounded-full border-white/40 text-black hover:bg-white/10"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtres
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {[
                { value: "all", label: "Tous" },
                { value: "active", label: "Actives" },
                { value: "inactive", label: "Inactives" },
                { value: "maintenance", label: "Maintenance" },
              ].map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setStatusFilter(option.value as typeof statusFilter)}
                >
                  {statusFilter === option.value && (
                    <Check className="mr-2 h-4 w-4 text-emerald-600" />
                  )}
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            className="rounded-full border-white/40 text-black hover:bg-white/10"
            onClick={handleExportToExcel}
            disabled={isExporting}
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? "Export..." : "Exporter"}
          </Button>
        </div> */}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            className="rounded-full bg-amber-500 text-white hover:bg-amber-400"
            onClick={() => setIsAddOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter une application
          </Button>
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_90px_rgba(15,23,42,0.08)] overflow-hidden">
        <div className="px-6 py-1.5 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Rechercher une application..."
                className="pl-10 rounded-full bg-slate-50 border-slate-200"
              />
            </div>
            <div className="flex items-center gap-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="rounded-full border-white/40 text-black hover:bg-white/10"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filtres
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {[
                    { value: "all", label: "Tous" },
                    { value: "active", label: "Actives" },
                    { value: "inactive", label: "Inactives" },
                    { value: "maintenance", label: "Maintenance" },
                  ].map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setStatusFilter(option.value as StatusFilterType)}
                    >
                      {statusFilter === option.value && (
                        <Check className="mr-2 h-4 w-4 text-emerald-600" />
                      )}
                      {option.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="outline"
                className="rounded-full border-white/40 text-black hover:bg-white/10"
                onClick={handleExportToExcel}
                disabled={isExporting}
              >
                <Download className="w-4 h-4 mr-2" />
                {isExporting ? "Export..." : "Exporter"}
              </Button>
            </div>
          </div>
          <div className="h-8 flex items-center">
            {statusFilter !== "all" && (
              <Badge className="rounded-full bg-slate-900 text-white px-4 py-2">
                Filtre: {statusLabelsMap[statusFilter]}
                <button
                  className="ml-2 text-xs uppercase tracking-wide"
                  onClick={() => setStatusFilter("all")}
                >
                  Réinitialiser
                </button>
              </Badge>
            )}
            {statusFilter === "all" && <div className="h-8"></div>}
          </div>
        </div>
        
        <div className="px-2 pb-2">
          <Table className="border border-slate-200 rounded-lg overflow-hidden">
            <TableHeader className="bg-slate-50">
              <TableRow className="hover:bg-slate-50">
                <TableHead className="font-semibold text-slate-700 bg-slate-50 first:rounded-tl-lg last:rounded-tr-lg">Nom</TableHead>
                <TableHead className="font-semibold text-slate-700 bg-slate-50">Description</TableHead>
                <TableHead className="font-semibold text-slate-700 bg-slate-50">Type & Plateforme</TableHead>
                <TableHead className="font-semibold text-slate-700 bg-slate-50">Version</TableHead>
                <TableHead className="font-semibold text-slate-700 bg-slate-50">Période d'essai</TableHead>
                <TableHead className="font-semibold text-slate-700 bg-slate-50">Date de création</TableHead>
                <TableHead className="font-semibold text-slate-700 bg-slate-50 text-right last:rounded-tr-lg">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 font-medium text-slate-500 rounded-b-lg">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : currentItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 font-medium text-slate-500 rounded-b-lg">
                    Aucune application trouvée
                  </TableCell>
                </TableRow>
              ) : (
                currentItems.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center font-semibold">
                          {getInitials(app.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{app.name}</p>
                          <p className="text-xs text-slate-400">{app.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500">{app.description || "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium capitalize text-slate-900">{app.type || "—"}</span>
                        <span className="text-xs text-slate-400">{app.platform || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{app.version || "—"}</TableCell>
                    <TableCell>
                      {app.hasTrialPolicy ? (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1.5 ${
                                app.trialPolicyEnabled
                                  ? "bg-green-100 text-green-800 border-2 border-green-400 shadow-sm"
                                  : "bg-gray-100 text-gray-600 border border-gray-300"
                              }`}
                            >
                              <div className={`h-2 w-2 rounded-full ${app.trialPolicyEnabled ? "bg-green-600 animate-pulse" : "bg-gray-400"}`}></div>
                              {app.trialPolicyEnabled ? "Actif" : "Inactif"}
                            </Badge>
                          </div>

                          {app.trialPeriodInDays && (
                            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-blue-100 border border-blue-200 w-fit">
                              <Clock className="h-3.5 w-3.5 text-blue-600" />
                              <span className="text-xs font-semibold text-slate-700">
                                {app.trialPeriodInDays} jour{app.trialPeriodInDays > 1 ? "s" : ""}
                              </span>
                            </div>
                          )}
                          {app.unlimitedAccess && (
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-orange-100 border border-orange-300 w-fit">
                              <Infinity className="h-3 w-3 text-orange-600" />
                              <span className="text-xs font-semibold text-orange-700">Accès illimité</span>
                            </div>
                          
                          )}
                        </div>
                      ) : (
                        <Badge variant="outline" className="rounded-full px-3 py-1 text-xs bg-purple-100 text-slate-500 border-purple-200 font-medium">
                          Aucune période
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-600">{formatDate(app.createdAt)}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Badge
                        variant="outline"
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          statusColorMap[app.status || ""] || "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {formatStatus(app.status)}
                      </Badge>
                      {onViewDetails && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-full"
                          onClick={() => onViewDetails(app)}
                        >
                          Détails
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        className="rounded-full"
                        onClick={() => {
                          setSelectedApp(app);
                          setFormData({
                            name: app.name ?? "",
                            description: app.description ?? "",
                            version: app.version ?? "",
                            type: app.type ?? "web",
                            platform: app.platform ?? "web",
                            iconUrl: app.iconUrl ?? "",
                            websiteUrl: app.websiteUrl ?? "",
                            supportEmail: app.supportEmail ?? "",
                            documentationUrl: app.documentationUrl ?? "",
                            configuration: app.configuration ?? null,
                          });
                          setIsEditOpen(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        className="rounded-full"
                        onClick={() => {
                          setSelectedApp(app);
                          setIsDeleteOpen(true);
                        }}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {!loading && (
              <TableCaption className="text-left px-6">
                {filteredApplications.length} application{filteredApplications.length > 1 ? "s" : ""} correspondant{filteredApplications.length > 1 ? "s" : ""} à vos critères.
              </TableCaption>
            )}
          </Table>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between border-t border-slate-200 px-8 py-4 bg-white/80 gap-3">
          <span className="text-sm text-slate-500">
            {loading ? "Chargement..." : `${filteredApplications.length} élément(s)`}
          </span>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              className="rounded-full px-6"
              disabled={currentPage === 1}
              onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              className="rounded-full px-6"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      </div>
      {/* ADD DIALOG */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une application</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nom</Label>
                <Input
                  value={formData.name}
                  onChange={e => handleInputChange("name", e.target.value)}
                  placeholder="Crowdfunding"
                />
              </div>
              <div>
                <Label>Version</Label>
                <Input
                  value={formData.version}
                  onChange={e => handleInputChange("version", e.target.value)}
                  placeholder="1.0.0"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Input
                  value={formData.type}
                  onChange={e => handleInputChange("type", e.target.value)}
                  placeholder="web"
                />
              </div>
              <div>
                <Label>Plateforme</Label>
                <Input
                  value={formData.platform}
                  onChange={e => handleInputChange("platform", e.target.value)}
                  placeholder="web"
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={e => handleInputChange("description", e.target.value)}
                placeholder="Application de levée de fonds"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Icon URL</Label>
                <Input
                  value={formData.iconUrl}
                  onChange={e => handleInputChange("iconUrl", e.target.value)}
                  placeholder="https://example.com/icon.png"
                />
              </div>
              <div>
                <Label>Site web</Label>
                <Input
                  value={formData.websiteUrl}
                  onChange={e => handleInputChange("websiteUrl", e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Email support</Label>
                <Input
                  type="email"
                  value={formData.supportEmail}
                  onChange={e => handleInputChange("supportEmail", e.target.value)}
                  placeholder="support@example.com"
                />
              </div>
              <div>
                <Label>Documentation</Label>
                <Input
                  value={formData.documentationUrl}
                  onChange={e => handleInputChange("documentationUrl", e.target.value)}
                  placeholder="https://example.com/docs"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleAddApplication}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDIT DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'application</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nom</Label>
                <Input
                  value={formData.name}
                  onChange={e => handleInputChange("name", e.target.value)}
                />
              </div>

              <div>
                <Label>Version</Label>
                <Input
                  value={formData.version}
                  onChange={e => handleInputChange("version", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Type</Label>
                <Input
                  value={formData.type}
                  onChange={e => handleInputChange("type", e.target.value)}
                />
              </div>

              <div>
                <Label>Plateforme</Label>
                <Input
                  value={formData.platform}
                  onChange={e => handleInputChange("platform", e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={e => handleInputChange("description", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Icon URL</Label>
                <Input
                  value={formData.iconUrl}
                  onChange={e => handleInputChange("iconUrl", e.target.value)}
                />
              </div>

              <div>
                <Label>Site web</Label>
                <Input
                  value={formData.websiteUrl}
                  onChange={e => handleInputChange("websiteUrl", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Email support</Label>
                <Input
                  type="email"
                  value={formData.supportEmail}
                  onChange={e => handleInputChange("supportEmail", e.target.value)}
                />
              </div>

              <div>
                <Label>Documentation</Label>
                <Input
                  value={formData.documentationUrl}
                  onChange={e => handleInputChange("documentationUrl", e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleEditApplication}>Sauvegarder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE DIALOG */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'application</DialogTitle>
          </DialogHeader>

          <p className="text-gray-600">
            Voulez-vous vraiment supprimer <span className="font-semibold">{selectedApp?.name}</span> ?
          </p>

          <DialogFooter>
            <Button variant="destructive" onClick={handleDeleteApplication}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default Applications;