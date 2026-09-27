"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { ImageUploader } from "@/components/admin/image-uploader";
import { RichTextRenderer } from "@/components/editor/rich-text-renderer";
import { richTextForStorage } from "@/lib/content/rich-text-media";
import { type LocationResult } from "@/components/public/location-autocomplete";
import { EventFormFields } from "@/components/admin/event-form-fields";
import { PlaceFormFields } from "@/components/admin/place-form-fields";
import { MultiSelect } from "@/components/ui/multi-select";
import { Input, Select, Textarea } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Box, Chip, MenuItem, Typography } from "@mui/material";
import { ActionGroup } from "@/components/ui/entity-card";
import { Modal } from "@/components/ui/modal";
type Props = {
  kind: "event" | "place";
  places?: Array<{ id: string; name: string }>;
  categories?: Array<{ id: string; name: string }>;
  panelPath?: string;
  canPublishDirect?: boolean;
  initial?: {
    id: string;
    name: string;
    slug: string;
    summary?: string | null;
    content?: object | null;
    coverMediaId?: string | null;
    coverUrl?: string | null;
    categoryIds: string[];
    status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "REJECTED" | "ARCHIVED";
    price?: string;
    capacity?: number | null;
    placeId?: string;
    occurrences?: Array<{ id?: string; startsAt: string; endsAt: string; timezone: string }>;
    address?: string;
    cityId?: string;
    latitude?: number;
    longitude?: number;
  };
};

const emptyContent = { type: "doc", content: [{ type: "paragraph" }] };
type OccurrenceDraft = { id?: string; startsAt: string; endsAt: string; timezone: string };
const emptyOccurrence = (): OccurrenceDraft => ({
  startsAt: "",
  endsAt: "",
  timezone: "America/Bogota",
});

export function ContentForm({
  kind,
  places = [],
  categories = [],
  panelPath = "/dashboard",
  canPublishDirect = false,
  initial,
}: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const addressRef = useRef(initial?.address ?? "");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [content, setContent] = useState<object>(initial?.content ?? emptyContent);
  const [coverMediaId, setCoverMediaId] = useState<string | null | undefined>(
    initial?.coverMediaId,
  );
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl ?? "");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
    initial?.categoryIds ?? [],
  );
  const [previewOpen, setPreviewOpen] = useState(false);
  const [occurrences, setOccurrences] = useState<OccurrenceDraft[]>(
    initial?.occurrences?.length ? initial.occurrences : [emptyOccurrence()],
  );
  const [editorKey, setEditorKey] = useState(0);
  const [uploaderKey, setUploaderKey] = useState(0);
  const [address, setAddress] = useState(initial?.address ?? "");
  const [cityId, setCityId] = useState(initial?.cityId ?? "");
  const [latitude, setLatitude] = useState<number | undefined>(initial?.latitude);
  const [longitude, setLongitude] = useState<number | undefined>(initial?.longitude);
  function applyLocation(result: LocationResult) {
    if (result.address) {
      addressRef.current = result.address;
      setAddress(result.address);
    }
    if (result.cityId) setCityId(result.cityId);
    if (result.latitude !== undefined && result.longitude !== undefined) {
      setLatitude(result.latitude);
      setLongitude(result.longitude);
    }
  }
  async function updateCoordinates(lat: number, lng: number) {
    setLatitude(lat);
    setLongitude(lng);
    // La geocodificación inversa es solo una sugerencia: nunca reemplaza texto escrito.
    if (addressRef.current.trim()) return;
    const response = await fetch(`/api/v1/locations/reverse?lat=${lat}&lng=${lng}`);
    const body = response.ok ? ((await response.json()) as { data?: { address?: string } }) : null;
    if (body?.data?.address && !addressRef.current.trim()) {
      addressRef.current = body.data.address;
      setAddress(body.data.address);
    }
  }
  function resetForAnother() {
    formRef.current?.reset();
    setContent(emptyContent);
    setCoverMediaId(undefined);
    setCoverUrl("");
    setSelectedCategoryIds([]);
    setOccurrences([emptyOccurrence()]);
    setPreviewOpen(false);
    setFeedback("");
    addressRef.current = "";
    setAddress("");
    setCityId("");
    setLatitude(undefined);
    setLongitude(undefined);
    setEditorKey((value) => value + 1);
    setUploaderKey((value) => value + 1);
  }
  async function submit(form: FormData) {
    setLoading(true);
    setFeedback("");
    const lat = form.get("lat");
    const lng = form.get("lng");
    const common = {
      name: form.get("name"),
      slug: form.get("slug") || undefined,
      summary: form.get("summary"),
      content: richTextForStorage(content),
      coverMediaId,
      address: form.get("address"),
      cityId: form.get("cityId"),
      lat: lat ? Number(lat) : undefined,
      lng: lng ? Number(lng) : undefined,
      categoryIds: selectedCategoryIds,
      status: form.get("status") || undefined,
    };
    const body =
      kind === "event"
        ? {
            ...common,
            price: Number(form.get("price")),
            capacity: form.get("capacity") ? Number(form.get("capacity")) : undefined,
            placeId: form.get("placeId"),
            occurrences,
          }
        : common;
    try {
      const resource = kind === "event" ? "events" : "places";
      const response = await fetch(`/api/v1/${resource}${initial ? `/${initial.id}` : ""}`, {
        method: initial ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        const message = result?.error?.message ?? "No fue posible guardar. Revisa los datos.";
        setFeedback(message);
        await Swal.fire({ title: "No se pudo guardar", text: message, icon: "error" });
        return;
      }
      setFeedback("");
      const result = await Swal.fire({
        title: initial
          ? kind === "event"
            ? "Evento actualizado"
            : "Lugar actualizado"
          : kind === "event"
            ? "Evento creado"
            : "Lugar creado",
        text: "El contenido se guardó correctamente.",
        icon: "success",
        showCancelButton: true,
        confirmButtonText: initial ? "Seguir editando" : "Crear otro",
        cancelButtonText: "Volver a gestión",
        reverseButtons: true,
        focusConfirm: true,
      });
      if (result.isConfirmed && !initial) resetForAnother();
      else if (!result.isConfirmed) router.push(panelPath);
    } catch {
      setFeedback("No fue posible conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <Box
      component="form"
      ref={formRef}
      action={submit}
      sx={{
        width: "min(100%, 760px)",
        mx: "auto",
        my: 4,
        p: 2.5,
        display: "grid",
        gap: 2,
        bgcolor: "background.paper",
        borderRadius: 1.5,
        boxShadow: 1,
      }}
    >
      <Box component="label" sx={{ display: "grid", gap: 0.75, fontWeight: 600 }}>
        Nombre
        <Input name="name" required minLength={3} defaultValue={initial?.name} />
      </Box>
      <Box component="label" sx={{ display: "grid", gap: 0.75, fontWeight: 600 }}>
        Slug
        <Input name="slug" placeholder="se genera automáticamente" defaultValue={initial?.slug} />
      </Box>
      <Box component="label" sx={{ display: "grid", gap: 0.75, fontWeight: 600 }}>
        Resumen
        <Textarea
          name="summary"
          required
          minLength={20}
          maxLength={300}
          rows={2}
          placeholder="Resumen corto para listados y SEO"
          defaultValue={initial?.summary ?? ""}
        />
      </Box>
      <div>
        <p className="field-label">Contenido enriquecido</p>
        <RichTextEditor
          key={editorKey}
          initialContent={initial?.content}
          kind={kind === "event" ? "EVENT" : "PLACE"}
          onChange={setContent}
        />
      </div>
      <input type="hidden" name="content" value={JSON.stringify(content)} readOnly />
      <div>
        <p className="field-label">Imagen principal</p>
        <ImageUploader
          key={uploaderKey}
          kind={kind === "event" ? "EVENT" : "PLACE"}
          onUploaded={(url, id) => {
            setCoverUrl(url);
            setCoverMediaId(id);
          }}
        />
        {coverUrl && (
          <ActionGroup>
            <Box
              component="img"
              src={coverUrl}
              alt="Portada actual"
              sx={{ maxWidth: 280, maxHeight: 180, objectFit: "cover", borderRadius: 1.5 }}
            />
            <Button
              variant="ghost"
              type="button"
              onClick={() => {
                setCoverMediaId(null);
                setCoverUrl("");
              }}
            >
              Quitar portada
            </Button>
          </ActionGroup>
        )}
      </div>
      {kind === "event" ? (
        <EventFormFields
          places={places}
          placeId={initial?.placeId}
          price={initial?.price}
          capacity={initial?.capacity}
          occurrences={occurrences}
          onChange={setOccurrences}
        />
      ) : (
        <PlaceFormFields
          address={address}
          cityId={cityId}
          latitude={latitude}
          longitude={longitude}
          requiredCoordinates={!initial}
          onAddress={(value) => {
            addressRef.current = value;
            setAddress(value);
          }}
          onCityId={setCityId}
          onCoordinates={(lat, lng) => {
            if (Number.isFinite(lat)) setLatitude(lat);
            else setLatitude(undefined);
            if (Number.isFinite(lng)) setLongitude(lng);
            else setLongitude(undefined);
            if (Number.isFinite(lat) && Number.isFinite(lng)) void updateCoordinates(lat, lng);
          }}
          onSelect={applyLocation}
        />
      )}
      <MultiSelect
        label="Categorías"
        options={categories}
        value={selectedCategoryIds}
        onChange={setSelectedCategoryIds}
      />
      <Box component="label" sx={{ display: "grid", gap: 0.75, fontWeight: 600 }}>
        Estado
        <Select name="status" defaultValue={initial?.status ?? "DRAFT"}>
          <MenuItem value="DRAFT">Borrador (solo tú y administración)</MenuItem>
          <MenuItem value="PENDING_REVIEW">Enviar a revisión</MenuItem>
          {canPublishDirect && <MenuItem value="PUBLISHED">Publicar ahora</MenuItem>}
          {initial?.status === "PUBLISHED" && !canPublishDirect && (
            <MenuItem value="PUBLISHED">Publicado</MenuItem>
          )}
          {initial?.status === "REJECTED" && <MenuItem value="REJECTED">Rechazado</MenuItem>}
          {initial?.status === "ARCHIVED" && <MenuItem value="ARCHIVED">Archivado</MenuItem>}
        </Select>
      </Box>
      {feedback && <p role="alert">{feedback}</p>}
      <ActionGroup>
        <Button type="button" variant="outline" onClick={() => setPreviewOpen(true)}>
          Vista previa
        </Button>
        <Button loading={loading}>{initial ? "Actualizar" : "Guardar"}</Button>
      </ActionGroup>
      {previewOpen && (
        <Modal title="Vista previa" onClose={() => setPreviewOpen(false)} size="lg">
          <Typography component="h2" variant="h5" id="preview-title">
            {document.querySelector<HTMLInputElement>('input[name="name"]')?.value || "Sin título"}
          </Typography>
          {coverUrl && (
            <Box
              component="img"
              src={coverUrl}
              alt="Portada"
              sx={{ width: "100%", maxHeight: 448, objectFit: "cover", borderRadius: 2 }}
            />
          )}
          <Typography component="p">
            {document.querySelector<HTMLTextAreaElement>('textarea[name="summary"]')?.value ||
              "Sin resumen"}
          </Typography>
          <RichTextRenderer content={content as never} />
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
            {selectedCategoryIds.map((id) => (
              <Chip
                key={id}
                label={categories.find((category) => category.id === id)?.name}
                size="small"
                color="secondary"
              />
            ))}
          </Box>
          <Button type="button" onClick={() => setPreviewOpen(false)}>
            Cerrar
          </Button>
        </Modal>
      )}
    </Box>
  );
}
