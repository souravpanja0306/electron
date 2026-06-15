import axios from "axios";

export const dumpDatabase = async () => {
    try {
        const response = await axios({
            url: "http://localhost:3001/api/v1/admin/dump-db",
            method: 'GET',
            responseType: 'blob', // important
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'backup.db');
        document.body.appendChild(link);
        link.click();
        link.remove();
        return { status: 200, message: "Download started" };
    } catch (error) {
        console.error("Failed to dump database", error);
        throw error;
    }
};

export const resetAllTables = async (token, tableNames) => {
    try {
        const response = await axios.get(`http://localhost:3001/api/v1/admin/reset-all-table?tableNames=${tableNames}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to reset tables", error);
        throw error;
    }
};

export const migrateDatabase = async (token, payload) => {
    try {
        const response = await axios.post(`http://localhost:3001/api/v1/admin/migrate-table`, payload, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error("Failed to migrate database", error);
        throw error;
    }
};
