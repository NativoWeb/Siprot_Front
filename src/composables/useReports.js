  import { ref, reactive } from 'vue'

  export function useReports() {
    const loading = ref(false)
    const error = ref(null)
    const reportes = ref([])
    const indicadores = ref([])
    const tiposReporte = ref([])

    // Ruta absoluta al backend
    const API_BASE = 'http://localhost:8000'

    const getToken = () =>
      localStorage.getItem('access_token') || sessionStorage.getItem('access_token')

    const fetchWithAuth = async (url, options = {}) => {
      const token = getToken()
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }

      const response = await fetch(url, { ...options, headers })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || response.statusText)
      }

      return response
    }

    const isAuthenticated = () => {
      const token = getToken()
      if (!token) return false
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        return payload.exp > Date.now() / 1000
      } catch (err) {
        return false
      }
    }

    const getCurrentUser = () => {
      const token = getToken()
      if (!token) return null
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        return {
          id: payload.sub,
          email: payload.email,
          is_admin: payload.is_admin || false,
          exp: payload.exp
        }
      } catch (err) {
        return null
      }
    }

    const logout = () => {
      localStorage.clear()
      sessionStorage.clear()
      window.location.href = '/login'
    }

    const formData = reactive({
      tipo: '',
      parametros: {
        indicadores_seleccionados: [],
        fecha_inicio: null,
        fecha_fin: null,
        comentarios_analista: ''
      }
    })

    const obtenerTiposReportes = async () => {
      try {
        loading.value = true
        error.value = null
        const res = await fetchWithAuth(`${API_BASE}/reportes/tipos`)
        const data = await res.json()
        tiposReporte.value = data
        return data
      } catch (err) {
        error.value = err.message
        throw err
      } finally {
        loading.value = false
      }
    }

    const obtenerIndicadores = async () => {
      try {
        loading.value = true
        error.value = null
        const res = await fetchWithAuth(`${API_BASE}/reportes/indicadores/`)
        const data = await res.json()
        indicadores.value = data
        return data
      } catch (err) {
        error.value = err.message
        throw err
      } finally {
        loading.value = false
      }
    }

    const generarReporte = async (solicitud) => {
      try {
        loading.value = true
        error.value = null
        const res = await fetchWithAuth(`${API_BASE}/reportes/generar`, {
          method: 'POST',
          body: JSON.stringify({
            ...solicitud,
            parametros: {
              ...solicitud.parametros,
              fecha_inicio: solicitud.parametros.fecha_inicio
                ? new Date(solicitud.parametros.fecha_inicio).toISOString().split('T')[0]
                : null,
              fecha_fin: solicitud.parametros.fecha_fin
                ? new Date(solicitud.parametros.fecha_fin).toISOString().split('T')[0]
                : null
            }
          })
        })
        return await res.json()
      } catch (err) {
        error.value = err.message
        throw err
      } finally {
        loading.value = false
      }
    }

    const listarMisReportes = async (skip = 0, limit = 100) => {
      try {
        loading.value = true
        error.value = null
        const res = await fetchWithAuth(`${API_BASE}/reportes/mis-reportes?skip=${skip}&limit=${limit}`)
        const data = await res.json()
        reportes.value = data
        return data
      } catch (err) {
        error.value = err.message
        throw err
      } finally {
        loading.value = false
      }
    }

    const obtenerReporte = async (reporteId) => {
      try {
        loading.value = true
        error.value = null
        const res = await fetchWithAuth(`${API_BASE}/reportes/${reporteId}`)
        return await res.json()
      } catch (err) {
        error.value = err.message
        throw err
      } finally {
        loading.value = false
      }
    }

    const descargarReporte = async (reporteId) => {
      try {
        loading.value = true
        error.value = null
        const res = await fetchWithAuth(`${API_BASE}/reportes/${reporteId}/descargar`, {
          method: 'GET'
        })
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `reporte_${reporteId}.pdf`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        return true
      } catch (err) {
        error.value = err.message
        throw err
      } finally {
        loading.value = false
      }
    }

    const eliminarReporte = async (reporteId) => {
      try {
        loading.value = true
        error.value = null
        await fetchWithAuth(`${API_BASE}/reportes/${reporteId}`, { method: 'DELETE' })
        reportes.value = reportes.value.filter(r => r.id !== reporteId)
      } catch (err) {
        error.value = err.message
        throw err
      } finally {
        loading.value = false
      }
    }

    const resetFormData = () => {
      formData.tipo = ''
      formData.parametros = {
        indicadores_seleccionados: [],
        fecha_inicio: null,
        fecha_fin: null,
        comentarios_analista: ''
      }
    }

    return {
      loading,
      error,
      reportes,
      indicadores,
      tiposReporte,
      formData,
      obtenerTiposReportes,
      obtenerIndicadores,
      generarReporte,
      listarMisReportes,
      obtenerReporte,
      descargarReporte,
      eliminarReporte,
      resetFormData,
      isAuthenticated,
      getCurrentUser,
      logout
    }
  }
