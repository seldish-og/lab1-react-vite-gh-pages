# Инструкция по настройке защиты ветки main на GitHub

## Шаг 1: Перейти в настройки репозитория

1. Откройте ваш репозиторий на GitHub: https://github.com/seldish-og/lab1-react-vite-gh-pages
2. Нажмите на вкладку **Settings** (настройки) в верхнем меню репозитория

## Шаг 2: Открыть настройки защиты веток

1. В левом боковом меню найдите раздел **Code and automation**
2. Нажмите на **Branches** (ветки)

## Шаг 3: Добавить правило защиты для ветки main

1. В разделе **Branch protection rules** нажмите кнопку **Add rule** (Добавить правило)

## Шаг 4: Настроить правило защиты

1. **Branch name pattern**: введите `main` (или `*` для всех веток)

2. **Обязательные проверки (Required status checks)**:

   - Включите чекбокс **Require status checks to pass before merging**
   - Включите чекбокс **Require branches to be up to date before merging**
   - В списке доступных проверок найдите и отметьте:
     - ✅ **Run Tests** (это job из вашего GitHub Actions workflow)

3. **Обязательные обзоры Pull Request (Required pull request reviews)**:

   - Включите чекбокс **Require a pull request before merging**
   - Опционально: включите **Require approvals** и укажите количество (например, 1)

4. **Остальные настройки** (опционально, но рекомендуется):

   - ✅ **Require conversation resolution before merging** - требует, чтобы все комментарии в PR были решены
   - ✅ **Do not allow bypassing the above settings** - запрещает обход правил даже администраторам

5. Нажмите кнопку **Create** (Создать) внизу страницы

## Результат

Теперь:

- ✅ Все изменения в ветку `main` должны проходить через Pull Request
- ✅ Pull Request не может быть смержен, пока не пройдут все тесты
- ✅ Тесты автоматически запускаются при каждом push в PR

## Проверка работы

1. Создайте новую ветку: `git checkout -b test-branch`
2. Внесите любое изменение и закоммитьте
3. Запушьте: `git push -u origin test-branch`
4. Создайте Pull Request на GitHub
5. Убедитесь, что запустился GitHub Actions workflow
6. Попробуйте смержить PR - должна быть заблокирована кнопка "Merge" до прохождения тестов
