import { $, component$, useSignal, useStore } from "@builder.io/qwik";

export interface ContactSuggestion {
    id: string;
    name?: string | null;
    email: string;
}

export interface RecipientInputProps {
    value?: string;
    suggestions?: ContactSuggestion[];
    onInput$?: (value: string) => void;
    onSelect$?: (email: string) => void;
    placeholder?: string;
    name?: string;
    required?: boolean;
}

export const RecipientInput = component$<RecipientInputProps>((props) => {
    const showSuggestions = useSignal(false);
    const inputRef = useSignal<HTMLInputElement>();
    const filteredSuggestions = useStore<ContactSuggestion[]>([]);

    const handleInput = $((event: Event) => {
        const target = event.target as HTMLInputElement;
        const value = target.value;

        if (props.onInput$) {
            props.onInput$(value);
        }

        // Filter suggestions based on input
        if (value.length > 1 && props.suggestions) {
            filteredSuggestions.splice(0, filteredSuggestions.length);
            const filtered = props.suggestions
                .filter(
                    (contact) =>
                        contact.email.toLowerCase().includes(value.toLowerCase()) ||
                        contact.name?.toLowerCase().includes(value.toLowerCase()),
                )
                .slice(0, 5); // Show max 5 suggestions
            filteredSuggestions.push(...filtered);
            showSuggestions.value = filtered.length > 0;
        } else {
            showSuggestions.value = false;
        }
    });

    const handleFocus = $(() => {
        if (filteredSuggestions.length > 0) {
            showSuggestions.value = true;
        }
    });

    const handleBlur = $(() => {
        // Delay hiding suggestions to allow clicking on them
        setTimeout(() => {
            showSuggestions.value = false;
        }, 200);
    });

    const selectSuggestion = $((contact: ContactSuggestion) => {
        if (inputRef.value) {
            inputRef.value.value = contact.email;
        }
        showSuggestions.value = false;
        if (props.onSelect$) {
            props.onSelect$(contact.email);
        }
    });

    return (
        <div class="relative w-full">
            <input
                ref={inputRef}
                type="email"
                name={props.name}
                value={props.value}
                placeholder={props.placeholder}
                required={props.required}
                onInput$={handleInput}
                onFocus$={handleFocus}
                onBlur$={handleBlur}
                class="flex h-9 w-full rounded-md border border-neutral-100 bg-neutral-100 px-3 py-2 text-sm outline-none ring-offset-background transition-all placeholder:text-muted-foreground hover:bg-neutral-200 focus-visible:bg-neutral-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {showSuggestions.value && filteredSuggestions.length > 0 && (
                <div class="absolute top-full z-10 mt-1 w-full rounded-md border border-neutral-200 bg-white shadow-lg">
                    {filteredSuggestions.map((contact) => (
                        <div
                            key={contact.id}
                            class="cursor-pointer border-neutral-100 border-b px-3 py-2 text-sm last:border-b-0 hover:bg-neutral-50"
                            onClick$={() => selectSuggestion(contact)}
                        >
                            <div class="flex items-center space-x-2">
                                <div class="flex-1">
                                    <div class="font-medium text-neutral-900">
                                        {contact.name || contact.email}
                                    </div>
                                    {contact.name && (
                                        <div class="text-neutral-500 text-xs">{contact.email}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
});
