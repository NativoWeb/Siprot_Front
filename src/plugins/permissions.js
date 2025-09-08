const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"

const getAuthHeaders = () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token")
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }
}

export const permissionsAPI = {
  // Obtener estadísticas de roles
  async getRolesStats() {
    const response = await fetch(`${API_BASE_URL}/permissions/roles-stats`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener estadísticas de roles")
    return response.json() 
  },

  // Obtener todos los permisos
  async getAllPermissions() {
    const response = await fetch(`${API_BASE_URL}/permissions/`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener permisos")
    return response.json()
  },

  // Obtener permisos de un rol específico
  async getRolePermissions(role) {
    const response = await fetch(`${API_BASE_URL}/permissions/role/${role}`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error(`Error al obtener permisos del rol ${role}`)
    return response.json()
  },

  // Actualizar permisos de un rol
  async updateRolePermissions(role, permissions) {
    const response = await fetch(`${API_BASE_URL}/permissions/roles/${role}/permissions`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ permissions }),
    })
    if (!response.ok) throw new Error(`Error al actualizar permisos del rol ${role}`)
    return response.json()
  },

  // Inicializar permisos del sistema
  async initializePermissions() {
    const response = await fetch(`${API_BASE_URL}/permissions/initialize`, {
      method: "POST",
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al inicializar permisos")
    return response.json()
  },
  // Obtener permisos de un usuario
  async getUserPermissions(userId) {
    const response = await fetch(`${API_BASE_URL}/permissions/user/${userId}/permissions`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al obtener permisos del usuario")
    return response.json()
  },

  // Asignar permiso individual
  async assignUserPermission(userId, permissionId) {
    const response = await fetch(`${API_BASE_URL}/permissions/users/${userId}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ permission_id: permissionId, granted: true }),
    })
    if (!response.ok) throw new Error("Error al asignar permiso al usuario")
    return response.json()
  },

  // Revocar permiso individual
  async revokeUserPermission(userId, permissionId) {
    const response = await fetch(`${API_BASE_URL}/permissions/users/${userId}/${permissionId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Error al revocar permiso del usuario")
    return response.json()
  },
}
