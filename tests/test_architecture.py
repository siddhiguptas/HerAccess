import ast
import os

def get_imports(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        tree = ast.parse(f.read(), filename=filepath)
    imports = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                imports.add(alias.name)
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                imports.add(node.module)
    return imports

def test_models_do_not_import_services_or_api():
    """Models should be the foundation and not depend on higher layers."""
    for root, _, files in os.walk("backend/models"):
        for file in files:
            if file.endswith(".py"):
                imports = get_imports(os.path.join(root, file))
                for imp in imports:
                    assert not imp.startswith("backend.services"), f"{file} imports {imp}"
                    assert not imp.startswith("backend.api"), f"{file} imports {imp}"
                    assert not imp.startswith("backend.ingestion"), f"{file} imports {imp}"

def test_repositories_do_not_import_api_or_services():
    """Repositories deal with DB and should not import API or Services."""
    for root, _, files in os.walk("backend/repositories"):
        for file in files:
            if file.endswith(".py"):
                imports = get_imports(os.path.join(root, file))
                for imp in imports:
                    assert not imp.startswith("backend.api"), f"{file} imports {imp}"
                    assert not imp.startswith("backend.services"), f"{file} imports {imp}"

def test_api_does_not_import_repositories_directly():
    """API routes should delegate to services and not use repositories directly."""
    for root, _, files in os.walk("backend/api"):
        for file in files:
            if file.endswith(".py"):
                imports = get_imports(os.path.join(root, file))
                for imp in imports:
                    assert not imp.startswith("backend.repositories"), f"{file} imports {imp}"

