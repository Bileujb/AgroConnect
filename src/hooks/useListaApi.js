import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function useListaApi(caminho) {
  const { usuario } = useAuth();
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const versao = useRef(0);
  const recarregar = useCallback(async () => {
    const atual = ++versao.current;
    if (!usuario) { setDados([]); return; }
    setCarregando(true); setErro('');
    try {
      const resultado = await api(caminho);
      if (atual === versao.current) setDados(resultado);
    } catch (falha) { if (atual === versao.current) setErro(falha.message); }
    finally { if (atual === versao.current) setCarregando(false); }
  }, [caminho, usuario?.id]);
  useEffect(() => { recarregar(); return () => { versao.current += 1; }; }, [recarregar]);
  return { dados, setDados, carregando, erro, recarregar };
}
