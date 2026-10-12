interface LoadingProps {
  label?: string;
}

export default function Loading({ label = "Loading..." }: LoadingProps) {
  return <div className="loading" role="status"><span className="spinner" aria-hidden="true" />{label}</div>;
}
