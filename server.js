const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Tus API Keys
const ETHERSCAN_API_KEY = 'VZFDUWB3YGQ1YCDKTCU1D6DDSS';
const BSCSCAN_API_KEY = 'ZM8ACMJB67C2IXKKBF8URFUNSY';
const ARBISCAN_API_KEY = 'B6SVGA7K3YBJEQ69AFKJF4YHVX';
const OPTIMISM_API_KEY = '66N5FRNV1ZD4I87S7MAHCJVXFJ';
const SNOWSCAN_API_KEY = 'ATJQERBKV1CI3GVKNSE3Q7RGEJ';

// ✅ Ruta principal para evitar "Cannot GET /"
app.get('/', (req, res) => {
    res.send('✅ Servidor del Token Checker funcionando. Usa /api/check-token?name=NOMBRE');
});

// Ruta para verificar token por nombre
app.get('/api/check-token', async (req, res) => {
    const { name } = req.query;

    if (!name) {
        return res.status(400).json({ error: 'Falta el parámetro "name"' });
    }

    const networks = ['eth', 'bsc', 'arb', 'opt', 'snow'];
    const results = {};

    try {
        for (const net of networks) {
            let apiUrl;

            // ✅ URLs corregidas: sin espacios al inicio
            switch (net) {
                case 'eth':
                    apiUrl = `https://api.etherscan.io/api?module=token&action=getTokenListByName&name=${name}&apikey=${ETHERSCAN_API_KEY}`;
                    break;
                case 'bsc':
                    apiUrl = `https://api.bscscan.com/api?module=token&action=getTokenListByName&name=${name}&apikey=${BSCSCAN_API_KEY}`;
                    break;
                case 'arb':
                    apiUrl = `https://api.arbiscan.io/api?module=token&action=getTokenListByName&name=${name}&apikey=${ARBISCAN_API_KEY}`;
                    break;
                case 'opt':
                    apiUrl = `https://api-optimistic.etherscan.io/api?module=token&action=getTokenListByName&name=${name}&apikey=${OPTIMISM_API_KEY}`;
                    break;
                case 'snow':
                    apiUrl = `https://api.snowscan.xyz/api?module=token&action=getTokenListByName&name=${name}&apikey=${SNOWSCAN_API_KEY}`;
                    break;
                default:
                    continue;
            }

            try {
                const response = await axios.get(apiUrl);
                const data = response.data;

                if (data.status === "1" && data.result && data.result.length > 0) {
                    results[net] = {
                        status: 'taken',
                        tokens: data.result.slice(0, 3).map(t => ({
                            name: t.name,
                            symbol: t.symbol,
                            address: t.contractAddress
                        }))
                    };
                } else {
                    results[net] = { status: 'available' };
                }
            } catch (error) {
                results[net] = { 
                    status: 'error', 
                    message: error.message || 'Error al conectar con la API' 
                };
            }
        }

        res.json({ name, results });

    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// ✅ Usa el puerto de Render o 3000 localmente
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor API listo en http://localhost:${PORT}`);
});