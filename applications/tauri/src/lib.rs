use std::sync::{Arc, Mutex, OnceLock};

use trition3d::message::Message;
use trition3d::project::Project;
use trition3d::realization::Realization;

static PROJECT: OnceLock<Arc<Mutex<Project>>> = OnceLock::new();
static REALIZATION_CACHE: OnceLock<Arc<Mutex<Option<Realization>>>> = OnceLock::new();

fn get_project() -> &'static Arc<Mutex<Project>> {
    PROJECT.get_or_init(|| Arc::new(Mutex::new(Project::new("Untitled"))))
}

fn get_cache() -> &'static Arc<Mutex<Option<Realization>>> {
    REALIZATION_CACHE.get_or_init(|| Arc::new(Mutex::new(None)))
}

#[tauri::command]
fn project_new(name: String) -> Result<String, String> {
    let p = Project::new(&name);
    let json = p.json();
    *get_project().lock().unwrap() = p;
    *get_cache().lock().unwrap() = None;
    Ok(json)
}

#[tauri::command]
fn project_from_json(json: String) -> Result<String, String> {
    let p = Project::from_json(&json);
    let json_out = p.json();
    *get_project().lock().unwrap() = p;
    *get_cache().lock().unwrap() = None;
    Ok(json_out)
}

#[tauri::command]
fn project_to_json() -> Result<String, String> {
    Ok(get_project().lock().unwrap().json())
}

#[tauri::command]
fn project_send_message(message_json: String) -> Result<String, String> {
    let msg: Message = serde_json::from_str(&message_json).map_err(|e| e.to_string())?;
    let mut proj = get_project().lock().unwrap();
    match msg.handle(&mut proj) {
        Ok(result) => {
            *get_cache().lock().unwrap() = None; // invalidate realization
            Ok(serde_json::to_string(&result).map_err(|e| e.to_string())?)
        }
        Err(e) => Err(e.to_string()),
    }
}

#[tauri::command]
fn project_get_workbench(index: u32) -> Result<String, String> {
    let p = get_project().lock().unwrap();
    let wb = &p.workbenches[index as usize];
    Ok(wb.json())
}

#[tauri::command]
fn project_get_realization(workbench_id: u32, max_steps: u32) -> Result<String, String> {
    // Check cache first
    {
        let cache = get_cache().lock().unwrap();
        if let Some(ref r) = *cache {
            return Ok(serde_json::to_string(r).map_err(|e| e.to_string())?);
        }
    }
    let p = get_project().lock().unwrap();
    let realized = p.get_realization(workbench_id as u64, max_steps as u64);
    let json = serde_json::to_string(&realized).map_err(|e| e.to_string())?;
    *get_cache().lock().unwrap() = Some(realized);
    Ok(json)
}

#[tauri::command]
fn project_compute_constraint_errors() -> Result<String, String> {
    let mut p = get_project().lock().unwrap();
    p.compute_constraint_errors();
    Ok(p.json())
}

#[tauri::command]
fn solid_to_obj(solid_name: String, tolerance: f64) -> Result<String, String> {
    let cache = get_cache().lock().unwrap();
    if let Some(ref r) = *cache {
        Ok(r.solid_to_obj(&solid_name, tolerance))
    } else {
        Err("No realization computed yet".into())
    }
}

#[tauri::command]
fn solid_to_step(solid_name: String) -> Result<String, String> {
    let cache = get_cache().lock().unwrap();
    if let Some(ref r) = *cache {
        Ok(r.solid_to_step(&solid_name))
    } else {
        Err("No realization computed yet".into())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            project_new,
            project_from_json,
            project_to_json,
            project_send_message,
            project_get_workbench,
            project_get_realization,
            project_compute_constraint_errors,
            solid_to_obj,
            solid_to_step,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
