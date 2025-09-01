// Permissions are handled by RequireWorkspace component
// This file is kept for potential future direct permission checks
export function useHasPermission(_permission: string): boolean {
	// For now, we assume permissions are validated by RequireWorkspace
	// In a more complex setup, this could make an API call to check permissions
	return true; // Placeholder - actual check is done by RequireWorkspace
}
