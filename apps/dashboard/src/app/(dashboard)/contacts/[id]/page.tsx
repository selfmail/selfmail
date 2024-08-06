export default function Contact({
  params,
}: {
  params: {
    id: string;
  };
}) {
  return <div>{params.id}</div>;
}
