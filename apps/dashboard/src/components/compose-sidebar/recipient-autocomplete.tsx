import {
  Autocomplete,
  AutocompleteContent,
  AutocompleteEmpty,
  AutocompleteInput,
  AutocompleteItem,
  AutocompleteList,
  Avatar,
  AvatarFallback,
} from "#/components/ui";
import { m } from "#/paraglide/messages";

interface Recipient {
  email: string;
  id: string;
  name: string;
}

interface RecipientAutocompleteProps {
  defaultValue?: string;
}

const recipients: readonly Recipient[] = [
  { email: "mara.hoffmann@example.com", id: "mara", name: "Mara Hoffmann" },
  { email: "leon.wagner@example.com", id: "leon", name: "Leon Wagner" },
  { email: "aylin.kaya@example.com", id: "aylin", name: "Aylin Kaya" },
  { email: "jonas.fischer@example.com", id: "jonas", name: "Jonas Fischer" },
  { email: "sofia.rossi@example.com", id: "sofia", name: "Sofia Rossi" },
  { email: "noah.mueller@example.com", id: "noah", name: "Noah Müller" },
];

const getRecipientValue = (recipient: Recipient) => recipient.email;

const filterRecipient = (recipient: Recipient, query: string) => {
  const normalizedQuery = query.trim().toLocaleLowerCase();

  return `${recipient.name} ${recipient.email}`
    .toLocaleLowerCase()
    .includes(normalizedQuery);
};

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

export function RecipientAutocomplete({
  defaultValue,
}: RecipientAutocompleteProps) {
  return (
    <Autocomplete
      autoHighlight
      defaultValue={defaultValue}
      filter={filterRecipient}
      items={recipients}
      itemToStringValue={getRecipientValue}
      limit={6}
      name="to"
      openOnInputClick
    >
      <AutocompleteInput
        aria-label={m["dashboard.compose.to"]()}
        autoComplete="off"
        className="h-14 rounded-none border-0 border-border border-b px-4 py-4 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        placeholder={m["dashboard.compose.recipient_search_placeholder"]()}
        required
        type="email"
      />
      <AutocompleteContent
        align="start"
        className="rounded-none"
        sideOffset={-1}
      >
        <AutocompleteEmpty>
          {m["dashboard.compose.no_recipient_matches"]()}
        </AutocompleteEmpty>
        <AutocompleteList>
          {(recipient: Recipient, index: number) => (
            <AutocompleteItem
              className={"cursor-pointer transition-colors hover:bg-accent"}
              index={index}
              key={recipient.id}
              value={recipient}
            >
              <Avatar className="size-9">
                <AvatarFallback className="text-xs">
                  {getInitials(recipient.name)}
                </AvatarFallback>
              </Avatar>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">
                  {recipient.name}
                </span>
                <span className="block truncate text-muted-foreground text-xs">
                  {recipient.email}
                </span>
              </span>
            </AutocompleteItem>
          )}
        </AutocompleteList>
      </AutocompleteContent>
    </Autocomplete>
  );
}
