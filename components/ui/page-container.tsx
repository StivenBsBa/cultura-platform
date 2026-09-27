import Container, { type ContainerProps } from "@mui/material/Container";

export function PageContainer({ component = "div", sx, ...props }: ContainerProps) {
  const extraSx = Array.isArray(sx) ? sx : sx ? [sx] : [];
  return (
    <Container
      {...props}
      component={component}
      maxWidth={false}
      disableGutters
      sx={[
        {
          width: "calc(100% - 3rem)",
          maxWidth: 1400,
          mx: "auto",
          p: 0,
          "@media (max-width:680px)": { width: "calc(100% - 2rem)" },
        },
        ...(component === "main" ? [{ py: "clamp(2rem, 4vw, 4rem)" }] : []),
        ...extraSx,
      ]}
    />
  );
}
