// src/save-clipboard-image.ts
import { showToast, Toast } from "@raycast/api";
import { execSync } from "child_process";
import { existsSync, statSync } from "fs";
import * as os from "os";
import * as path from "path";

export default function main() {
  const home = os.homedir();
  const downloads = path.join(home, "Downloads");
  const filename = `clipboard-${new Date().toISOString().replace(/[:.]/g, "-")}.png`;
  const dest = path.join(downloads, filename);

  // Точное местоположение pngpaste из Homebrew на Apple Silicon
  const pngpastePath = "/opt/homebrew/bin/pngpaste";

  if (!existsSync(pngpastePath)) {
    showToast(Toast.Style.Failure, "pngpaste не найден", `Установите его: brew install pngpaste`);
    return;
  }

  try {
    // Запускаем pngpaste с гарантированным PATH
    execSync(`"${pngpastePath}" "${dest}"`, {
      env: { ...process.env, PATH: `${path.dirname(pngpastePath)}:${process.env.PATH}` },
      stdio: "ignore",
    });

    // Проверим, что файл создался и не нулевого размера
    const stats = statSync(dest);
    if (stats.size > 0) {
      showToast(Toast.Style.Success, "Сохранено изображение", filename);
    } else {
      throw new Error("пустой файл");
    }
   
  } catch {
    // Если что-то пошло не так — удалим «пустой» файл, если он есть
    if (existsSync(dest)) {
      // eslint-disable-next-line no-empty
      try { execSync(`rm "${dest}"`); } catch {}
    }
    showToast(Toast.Style.Failure, "Не удалось сохранить", "В буфере нет изображения или проблема с pngpaste");
  }
}